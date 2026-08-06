import { prisma } from "@/lib/prisma";
import type { VerificationPurpose } from "@/lib/validations/auth";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10분
const RESEND_COOLDOWN_MS = 60 * 1000; // 60초
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export class OtpCooldownError extends Error {
  constructor() {
    super("잠시 후 다시 시도해주세요.");
    this.name = "OtpCooldownError";
  }
}

/** Invalidates any prior unconsumed code and issues a fresh one. */
export async function issueOtp(email: string, purpose: VerificationPurpose): Promise<string> {
  const recent = await prisma.verificationCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new OtpCooldownError();
  }

  await prisma.verificationCode.deleteMany({ where: { email, purpose, verified: false } });

  const code = generateCode();
  await prisma.verificationCode.create({
    data: { email, purpose, code, expiresAt: new Date(Date.now() + OTP_EXPIRY_MS) },
  });
  return code;
}

export async function verifyOtp(
  email: string,
  purpose: VerificationPurpose,
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  const record = await prisma.verificationCode.findFirst({
    where: { email, purpose, verified: false },
    orderBy: { createdAt: "desc" },
  });
  if (!record || record.expiresAt < new Date()) {
    return { ok: false, error: "인증번호가 만료되었습니다. 다시 요청해주세요." };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "시도 횟수를 초과했습니다. 인증번호를 다시 요청해주세요." };
  }
  if (record.code !== code) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "인증번호가 일치하지 않습니다." };
  }

  await prisma.verificationCode.update({ where: { id: record.id }, data: { verified: true } });
  return { ok: true };
}

/** Gate used by registration endpoints: has this email already passed OTP verification? */
export async function isEmailVerified(
  email: string,
  purpose: VerificationPurpose,
): Promise<boolean> {
  const record = await prisma.verificationCode.findFirst({
    where: { email, purpose, verified: true, expiresAt: { gte: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  return !!record;
}

export async function consumeVerification(email: string, purpose: VerificationPurpose) {
  await prisma.verificationCode.deleteMany({ where: { email, purpose } });
}
