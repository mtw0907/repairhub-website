import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { notifyCompanyOwners } from "@/lib/notify";
import { RESERVATION_METHODS, type ReservationMethod } from "@/lib/constants";

// Used by the mobile app (the web dashboard queries Prisma directly in its
// server component instead — src/app/(user)/dashboard/reservations/page.tsx).
export async function GET() {
  try {
    const user = await requireRole(["USER"]);
    const reservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      include: { company: { select: { id: true, name: true, phone: true, address: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      reservations.map((r) => ({ ...r, scheduledAt: r.scheduledAt?.toISOString() ?? null, createdAt: r.createdAt.toISOString() })),
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const {
      companyId,
      scheduledAt,
      memo,
      method,
      visitAddress,
      instrumentCategory,
      instrument,
      categoryId,
      deviceId,
      brand,
      symptom,
    } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "companyId가 필요합니다." }, { status: 400 });
    }
    if (
      !String(instrumentCategory ?? "").trim() ||
      !instrument ||
      !String(brand ?? "").trim() ||
      !String(symptom ?? "").trim()
    ) {
      return NextResponse.json(
        { error: "악기/음향기기 종류, 브랜드, 증상을 모두 입력해주세요." },
        { status: 400 },
      );
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

    let verifiedDeviceId: string | null = null;
    if (deviceId) {
      const device = await prisma.userDevice.findUnique({ where: { id: deviceId } });
      if (device && device.userId === user.id) {
        verifiedDeviceId = deviceId;
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        companyId,
        method: resolvedMethod,
        visitAddress: visitAddress || null,
        instrumentCategory,
        instrument,
        categoryId: categoryId || null,
        deviceId: verifiedDeviceId,
        brand: String(brand).trim(),
        symptom: String(symptom).trim(),
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
