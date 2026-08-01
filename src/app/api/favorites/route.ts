import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { companyId } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "companyId가 필요합니다." }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_companyId: { userId: user.id, companyId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({ data: { userId: user.id, companyId } });
    return NextResponse.json({ favorited: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
