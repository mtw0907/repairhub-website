import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";
import { notifyCompanyOwners } from "@/lib/notify";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["USER"]);
    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { repairRequest: true },
    });
    if (!quote) {
      return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
    }
    if (quote.repairRequest.userId !== user.id) {
      throw new ForbiddenError();
    }
    if (quote.status !== "PENDING") {
      return NextResponse.json({ error: "이미 처리된 견적입니다." }, { status: 409 });
    }

    const reservation = await prisma.$transaction(async (tx) => {
      const created = await tx.reservation.create({
        data: {
          userId: user.id,
          companyId: quote.companyId,
          status: "REQUESTED",
          scheduledAt: quote.availableDate,
          memo: quote.message ?? `AI 견적 매칭 예약 (수리 요청 #${quote.repairRequestId})`,
          quoteId: quote.id,
          repairRequestId: quote.repairRequestId,
        },
      });

      await tx.quote.update({ where: { id: quote.id }, data: { status: "ACCEPTED" } });
      await tx.quote.updateMany({
        where: { repairRequestId: quote.repairRequestId, id: { not: quote.id }, status: "PENDING" },
        data: { status: "DECLINED" },
      });
      await tx.repairRequest.update({
        where: { id: quote.repairRequestId },
        data: { status: "RESERVED" },
      });

      return created;
    });

    await notifyCompanyOwners(quote.companyId, {
      type: "NEW_RESERVATION",
      title: "견적이 수락되어 예약이 확정됐습니다",
      link: "/partner/dashboard/reservations",
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
