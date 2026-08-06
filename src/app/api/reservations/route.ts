import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { notifyCompanyOwners } from "@/lib/notify";

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
        statusLogs: { create: { status: "REQUESTED" } },
      },
    });

    await notifyCompanyOwners(companyId, {
      type: "NEW_RESERVATION",
      title: "새 예약 요청이 도착했습니다",
      link: "/partner/dashboard/reservations",
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
