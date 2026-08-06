import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";
import { notifyCompanyOwners } from "@/lib/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["USER"]);
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation || reservation.userId !== user.id) {
      throw new ForbiddenError();
    }
    if (reservation.status === "COMPLETED" || reservation.status === "CANCELED") {
      return NextResponse.json(
        { error: "이미 완료되었거나 취소된 예약입니다." },
        { status: 409 },
      );
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELED", statusLogs: { create: { status: "CANCELED" } } },
    });

    await notifyCompanyOwners(reservation.companyId, {
      type: "RESERVATION_CHANGED",
      title: "사용자가 예약을 취소했습니다",
      link: "/partner/dashboard/reservations",
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
