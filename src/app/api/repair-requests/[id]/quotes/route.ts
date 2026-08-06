import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";
import { notify } from "@/lib/notify";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { id } = await params;
    const { price, duration, availableDate, onSiteAvailable, message } = await req.json();

    if (!price || !duration) {
      return NextResponse.json({ error: "price, duration은 필수입니다." }, { status: 400 });
    }
    if (!user.companyId) {
      throw new ForbiddenError();
    }

    const repairRequest = await prisma.repairRequest.findUnique({ where: { id } });
    if (!repairRequest) {
      return NextResponse.json({ error: "요청을 찾을 수 없습니다." }, { status: 404 });
    }
    const matchedCompanyIds: string[] = repairRequest.matchedCompanyIds
      ? JSON.parse(repairRequest.matchedCompanyIds)
      : [];
    if (!matchedCompanyIds.includes(user.companyId)) {
      throw new ForbiddenError();
    }
    if (repairRequest.status === "RESERVED" || repairRequest.status === "CLOSED") {
      return NextResponse.json(
        { error: "이미 예약이 완료되었거나 종료된 요청입니다." },
        { status: 409 },
      );
    }

    const quote = await prisma.quote.upsert({
      where: {
        repairRequestId_companyId: { repairRequestId: id, companyId: user.companyId },
      },
      update: {
        price: Number(price),
        duration,
        availableDate: availableDate ? new Date(availableDate) : null,
        onSiteAvailable: Boolean(onSiteAvailable),
        message: message || null,
      },
      create: {
        repairRequestId: id,
        companyId: user.companyId,
        price: Number(price),
        duration,
        availableDate: availableDate ? new Date(availableDate) : null,
        onSiteAvailable: Boolean(onSiteAvailable),
        message: message || null,
      },
    });

    if (repairRequest.status === "MATCHING") {
      await prisma.repairRequest.update({ where: { id }, data: { status: "QUOTED" } });
    }

    await notify(repairRequest.userId, {
      type: "NEW_QUOTE",
      title: "새 견적이 도착했습니다",
      link: `/dashboard/repair-requests/${id}`,
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
