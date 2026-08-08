import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { isLoginOtpEnabled } from "@/lib/systemSettings";
import { issueOtp, OtpCooldownError } from "@/lib/otp";
import { sendMail, toEmailErrorResponse } from "@/lib/email";

const INVALID_CREDENTIALS_MESSAGE = "이메일 또는 비밀번호가 올바르지 않습니다.";

/**
 * Pre-check step for the two-step login flow: verifies email+password (but
 * never creates a session — only next-auth's authorize() does that) and, if
 * login OTP is enabled, sends the code and tells the client to show the OTP
 * step. Shares its rate-limit keys with authorize() so this can't be used
 * as an unlimited password-guessing oracle around that gate.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: INVALID_CREDENTIALS_MESSAGE }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const ip = getClientIp(req);
    const [emailAllowed, ipAllowed] = await Promise.all([
      checkRateLimit(`login:email:${email}`, 8, 10 * 60 * 1000),
      checkRateLimit(`login:ip:${ip}`, 30, 10 * 60 * 1000),
    ]);
    if (!emailAllowed || !ipAllowed) {
      return NextResponse.json({ error: "잠시 후 다시 시도해주세요." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE" || !user.password) {
      return NextResponse.json({ error: INVALID_CREDENTIALS_MESSAGE }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: INVALID_CREDENTIALS_MESSAGE }, { status: 401 });
    }

    if (!(await isLoginOtpEnabled())) {
      return NextResponse.json({ requiresOtp: false });
    }

    const code = await issueOtp(email, "LOGIN");
    await sendMail({
      to: email,
      subject: "[RepairHub] 로그인 인증번호",
      text: `인증번호: ${code}\n10분 이내에 입력해주세요.`,
    });

    return NextResponse.json({ requiresOtp: true });
  } catch (error) {
    // A code was already sent within the last 60s (e.g. accidental double
    // submit) — that code is still valid, so just move the client on to
    // the OTP step instead of surfacing this as an error.
    if (error instanceof OtpCooldownError) {
      return NextResponse.json({ requiresOtp: true });
    }
    return toEmailErrorResponse(error);
  }
}
