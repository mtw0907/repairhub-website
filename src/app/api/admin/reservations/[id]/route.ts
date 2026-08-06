import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { RESERVATION_STATUSES, RESERVATION_STATUS_LABEL, type ReservationStatus } from "@/lib/constants";
import { notify } from "@/lib/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const { status } = await req.json();

    if (!RESERVATION_STATUSES.includes(status)) {
      return NextResponse.json({ error: "올바르지 않은 상태값입니다." }, { status: 400 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status, statusLogs: { create: { status } } },
    });

    if (updated.notifyEnabled) {
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
