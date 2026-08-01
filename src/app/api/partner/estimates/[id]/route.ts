import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { id } = await params;

    const estimate = await prisma.estimate.findUnique({ where: { id } });
    if (!estimate || estimate.companyId !== user.companyId) {
      throw new ForbiddenError();
    }

    const { answer } = await req.json();
    if (!answer) {
      return NextResponse.json({ error: "answer가 필요합니다." }, { status: 400 });
    }

    const updated = await prisma.estimate.update({
      where: { id },
      data: { answer, status: "ANSWERED" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
