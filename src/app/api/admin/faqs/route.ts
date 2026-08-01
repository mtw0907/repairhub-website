import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"]);
    const { question, answer } = await req.json();
    if (!question || !answer) {
      return NextResponse.json({ error: "question, answer가 필요합니다." }, { status: 400 });
    }
    const faq = await prisma.faq.create({ data: { question, answer } });
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
