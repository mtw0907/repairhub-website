import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError, toErrorResponse } from "@/lib/rbac";

export async function POST() {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const subscription = await prisma.subscription.findFirst({
      where: { companyId: user.companyId, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });
    if (!subscription) {
      return NextResponse.json({ error: "활성화된 구독이 없습니다." }, { status: 404 });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELED", endsAt: new Date() },
    });

    await prisma.company.update({
      where: { id: user.companyId },
      data: { isPremium: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
