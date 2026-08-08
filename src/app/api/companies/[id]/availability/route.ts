import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSlotsForDate } from "@/lib/businessHours";

/** GET /api/companies/[id]/availability?date=YYYY-MM-DD -> { slots: string[] } */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dateParam = new URL(req.url).searchParams.get("date");
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "date=YYYY-MM-DD 형식이 필요합니다." }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id },
    select: { businessHours: true, closedDays: true },
  });
  if (!company) {
    return NextResponse.json({ error: "업체를 찾을 수 없습니다." }, { status: 404 });
  }

  const [y, m, d] = dateParam.split("-").map(Number);
  const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

  const booked = await prisma.reservation.findMany({
    where: {
      companyId: id,
      status: { not: "CANCELED" },
      scheduledAt: { gte: dayStart, lte: dayEnd },
    },
    select: { scheduledAt: true },
  });
  const bookedTimes = booked
    .map((r) => r.scheduledAt)
    .filter((d): d is Date => d != null)
    .map((d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);

  const slots = getSlotsForDate(company.businessHours, company.closedDays, dayStart, bookedTimes);

  return NextResponse.json({ slots });
}
