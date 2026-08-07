import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerPartnerSchema } from "@/lib/validations/auth";
import { isRegistrationLocked } from "@/lib/systemSettings";
import { isEmailVerified, consumeVerification } from "@/lib/otp";
import { runAiVisionCompletion } from "@/lib/ai";
import { readUploadedFileAsDataUrl } from "@/lib/uploadStorage";
import { notifyRole } from "@/lib/notify";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const VERIFICATION_SYSTEM_PROMPT = `당신은 사업자등록증 1차 검토 담당자입니다. 첨부된 이미지가 대한민국
사업자등록증처럼 보이는지, 그리고 이미지에서 읽을 수 있는 상호명·사업자등록번호·대표자명이 아래 입력값과
일치하는지만 확인하세요. 국세청에 실제로 등록된 사업자인지는 이 방법으로 확인할 수 없으므로 그 사실을
notes에 반드시 명시하세요. 반드시 아래 JSON 형식으로만 응답하세요:
{"looksLikeCertificate":true,"nameMatch":true,"bizRegNoMatch":true,"ownerNameMatch":true,"confidence":"HIGH","notes":"..."}`;

export async function POST(req: Request) {
  if (await isRegistrationLocked()) {
    return NextResponse.json(
      { error: "현재 신규 회원가입이 잠겨 있습니다. 나중에 다시 시도해주세요." },
      { status: 403 },
    );
  }

  const ip = getClientIp(req);
  if (!(await checkRateLimit(`register:ip:${ip}`, 5, 60 * 60 * 1000))) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = registerPartnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  if (!(await isEmailVerified(data.email, "REGISTER_PARTNER"))) {
    return NextResponse.json({ error: "이메일 인증을 먼저 완료해주세요." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const { company, user } = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: data.companyName,
        ownerName: data.ownerName,
        bizRegNo: data.bizRegNo,
        address: data.address,
        region: data.region,
        certificateUrl: data.certificateUrl,
        status: "PENDING",
      },
    });
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        phone: data.phone,
        role: "PARTNER",
        companyId: company.id,
        termsAgreedAt: new Date(),
      },
    });
    return { company, user };
  });

  await notifyRole("ADMIN", {
    type: "PARTNER_SIGNUP",
    title: `새 파트너 가입 신청: ${company.name}`,
    link: "/admin/dashboard/companies",
  });

  // AI 검증은 참고용 신호일 뿐이므로, 실패해도 가입 자체는 성공시킨다.
  let aiVerificationResult: Record<string, unknown>;
  try {
    const imageDataUrl = await readUploadedFileAsDataUrl(data.certificateUrl);
    const raw = await runAiVisionCompletion({
      type: "BIZ_CERT_VERIFICATION",
      system: VERIFICATION_SYSTEM_PROMPT,
      userText: `상호명: ${data.companyName}\n대표자명: ${data.ownerName}\n사업자등록번호: ${data.bizRegNo}`,
      imageDataUrl,
      userId: user.id,
      json: true,
    });
    aiVerificationResult = { ok: true, ...JSON.parse(raw) };
  } catch (error) {
    aiVerificationResult = {
      ok: false,
      reason: error instanceof Error ? error.message : "AI 검증 중 알 수 없는 오류가 발생했습니다.",
    };
  }

  await prisma.company.update({
    where: { id: company.id },
    data: { aiVerificationResult: JSON.stringify(aiVerificationResult) },
  });

  await consumeVerification(data.email, "REGISTER_PARTNER");

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
