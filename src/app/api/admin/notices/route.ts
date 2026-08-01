import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"]);
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "title, content가 필요합니다." }, { status: 400 });
    }
    const notice = await prisma.notice.create({ data: { title, content } });
    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
