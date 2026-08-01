import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { COMPANY_STATUSES } from "@/lib/constants";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const { status, isPremium, isFeatured, ...rest } = await req.json();

    if (status !== undefined && !COMPANY_STATUSES.includes(status)) {
      return NextResponse.json({ error: "올바르지 않은 상태값입니다." }, { status: 400 });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined ? { status } : {}),
        ...(isPremium !== undefined ? { isPremium } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;

    const [reservations, estimates, reviews, inquiries] = await Promise.all([
      prisma.reservation.count({ where: { companyId: id } }),
      prisma.estimate.count({ where: { companyId: id } }),
      prisma.review.count({ where: { companyId: id } }),
      prisma.inquiry.count({ where: { companyId: id } }),
    ]);

    if (reservations + estimates + reviews + inquiries > 0) {
      return NextResponse.json(
        {
          error:
            "예약/견적/후기/문의 기록이 있는 업체는 삭제할 수 없습니다. 대신 '정지' 상태로 변경해주세요.",
        },
        { status: 409 },
      );
    }

    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
