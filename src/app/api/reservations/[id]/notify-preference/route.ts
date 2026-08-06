import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["USER"]);
    const { id } = await params;
    const { notifyEnabled } = await req.json();
    if (typeof notifyEnabled !== "boolean") {
      return NextResponse.json({ error: "notifyEnabled(boolean)이 필요합니다." }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation || reservation.userId !== user.id) {
      throw new ForbiddenError();
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { notifyEnabled },
    });

    return NextResponse.json({ notifyEnabled: updated.notifyEnabled });
  } catch (error) {
    return toErrorResponse(error);
  }
}
