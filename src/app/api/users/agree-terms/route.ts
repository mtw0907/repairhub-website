import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, toErrorResponse } from "@/lib/rbac";

const agreeTermsSchema = z.object({
  agreeTerms: z.literal(true, "이용약관에 동의해주세요."),
  agreePrivacy: z.literal(true, "개인정보 수집 및 이용에 동의해주세요."),
});

export async function POST(req: Request) {
  try {
    const user = await requireSession();
    const body = await req.json();
    const parsed = agreeTermsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { termsAgreedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
