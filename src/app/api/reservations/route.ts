import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { notifyCompanyOwners } from "@/lib/notify";
import { RESERVATION_METHODS, type ReservationMethod } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { companyId, scheduledAt, memo, method, visitAddress } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "companyId가 필요합니다." }, { status: 400 });
    }

    const resolvedMethod: ReservationMethod = RESERVATION_METHODS.includes(method)
      ? method
      : "VISIT";

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { onSiteVisit: true, courierDrop: true },
    });
    if (!company) {
      return NextResponse.json({ error: "업체를 찾을 수 없습니다." }, { status: 404 });
    }
    if (resolvedMethod === "ONSITE" && !company.onSiteVisit) {
      return NextResponse.json({ error: "이 업체는 출장 예약을 지원하지 않습니다." }, { status: 400 });
    }
    if (resolvedMethod === "COURIER" && !company.courierDrop) {
      return NextResponse.json({ error: "이 업체는 택배 예약을 지원하지 않습니다." }, { status: 400 });
    }
    if (resolvedMethod === "ONSITE" && !visitAddress) {
      return NextResponse.json({ error: "출장 방문 주소를 입력해주세요." }, { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        companyId,
        method: resolvedMethod,
        visitAddress: visitAddress || null,
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
