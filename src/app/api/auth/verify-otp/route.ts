import { NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { verifyOtp } from "@/lib/otp";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, code, purpose } = parsed.data;

  const result = await verifyOtp(email, purpose, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
