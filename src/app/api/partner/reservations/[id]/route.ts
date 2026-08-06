import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";
import { RESERVATION_STATUSES, RESERVATION_STATUS_LABEL, type ReservationStatus } from "@/lib/constants";
import { notify } from "@/lib/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation || reservation.companyId !== user.companyId) {
      throw new ForbiddenError();
    }

    const { status, memo, scheduledAt, completedAmount } = await req.json();
    if (status !== undefined && !RESERVATION_STATUSES.includes(status)) {
      return NextResponse.json({ error: "올바르지 않은 상태값입니다." }, { status: 400 });
    }
    if (
      completedAmount !== undefined &&
      completedAmount !== null &&
      (!Number.isInteger(completedAmount) || completedAmount < 0)
    ) {
      return NextResponse.json({ error: "금액은 0 이상의 정수여야 합니다." }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status, statusLogs: { create: { status } } } : {}),
        ...(memo !== undefined ? { memo } : {}),
        ...(scheduledAt !== undefined
          ? { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }
          : {}),
        ...(completedAmount !== undefined ? { completedAmount } : {}),
      },
    });

    if (status !== undefined && updated.notifyEnabled) {
      await notify(updated.userId, {
        type: "RESERVATION_STATUS",
        title: `예약이 ${RESERVATION_STATUS_LABEL[status as ReservationStatus]} 상태로 변경됐습니다`,
        link: `/dashboard/reservations/${updated.id}`,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
