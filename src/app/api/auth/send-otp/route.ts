import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSchema } from "@/lib/validations/auth";
import { issueOtp, OtpCooldownError } from "@/lib/otp";
import { sendMail, toEmailErrorResponse } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!(await checkRateLimit(`otp:ip:${ip}`, 10, 60 * 60 * 1000))) {
      return NextResponse.json({ error: "잠시 후 다시 시도해주세요." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { email, purpose } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (purpose === "RESET_PASSWORD") {
      // Don't reveal whether the email is registered — only send if it is.
      if (existing) {
        const code = await issueOtp(email, purpose);
        await sendMail({
          to: email,
          subject: "[RepairHub] 비밀번호 재설정 인증번호",
          text: `인증번호: ${code}\n10분 이내에 입력해주세요.`,
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (existing) {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }

    const code = await issueOtp(email, purpose);

    await sendMail({
      to: email,
      subject: "[RepairHub] 이메일 인증번호",
      text: `인증번호: ${code}\n10분 이내에 입력해주세요.`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof OtpCooldownError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return toEmailErrorResponse(error);
  }
}
