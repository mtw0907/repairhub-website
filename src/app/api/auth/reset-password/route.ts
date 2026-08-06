import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { isEmailVerified, consumeVerification } from "@/lib/otp";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, newPassword } = parsed.data;

  if (!(await isEmailVerified(email, "RESET_PASSWORD"))) {
    return NextResponse.json({ error: "이메일 인증을 먼저 완료해주세요." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "가입된 계정을 찾을 수 없습니다." }, { status: 404 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { password: hashed } });

  await consumeVerification(email, "RESET_PASSWORD");

  return NextResponse.json({ ok: true });
}
