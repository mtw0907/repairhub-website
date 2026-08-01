import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { companyId, scheduledAt, memo } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "companyId가 필요합니다." }, { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        companyId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        memo: memo || null,
        status: "REQUESTED",
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
