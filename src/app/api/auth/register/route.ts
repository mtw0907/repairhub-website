import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { isRegistrationLocked } from "@/lib/systemSettings";
import { isEmailVerified, consumeVerification } from "@/lib/otp";

export async function POST(req: Request) {
  if (await isRegistrationLocked()) {
    return NextResponse.json(
      { error: "현재 신규 회원가입이 잠겨 있습니다. 나중에 다시 시도해주세요." },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  if (!(await isEmailVerified(parsed.data.email, "REGISTER_USER"))) {
    return NextResponse.json({ error: "이메일 인증을 먼저 완료해주세요." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: hashed,
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: "USER",
    },
  });

  await consumeVerification(parsed.data.email, "REGISTER_USER");

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
