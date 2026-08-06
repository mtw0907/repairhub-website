import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { getSetting } from "@/lib/systemSettings";
import { toErrorResponse } from "@/lib/rbac";

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("이메일 발송 기능을 사용하려면 최고관리자가 시스템 설정에서 SMTP 정보를 등록해야 합니다.");
    this.name = "EmailNotConfiguredError";
  }
}

async function getTransport() {
  const host = await getSetting("SMTP_HOST");
  const port = await getSetting("SMTP_PORT");
  const user = await getSetting("SMTP_USER");
  const pass = await getSetting("SMTP_PASSWORD");
  if (!host || !port || !user || !pass) throw new EmailNotConfiguredError();
  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
}

export async function sendMail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const transport = await getTransport();
  const from = (await getSetting("SMTP_FROM")) || (await getSetting("SMTP_USER"))!;
  await transport.sendMail({ from, to, subject, text });
}

// Maps EmailNotConfiguredError to a 503 ("not set up yet", not a real failure)
// and falls back to the standard RBAC error mapping for everything else.
export function toEmailErrorResponse(error: unknown): NextResponse {
  if (error instanceof EmailNotConfiguredError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  return toErrorResponse(error);
}
