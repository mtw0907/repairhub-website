import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const { status } = await req.json();

    if (status !== "RESOLVED" && status !== "DISMISSED") {
      return NextResponse.json({ error: "올바르지 않은 상태값입니다." }, { status: 400 });
    }

    const updated = await prisma.report.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
