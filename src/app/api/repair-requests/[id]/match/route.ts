import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";
import { REPAIR_REQUEST_MAX_MATCHES } from "@/lib/constants";
import { notifyCompanyOwners } from "@/lib/notify";

type Filters = {
  onSiteOnly?: boolean;
  sameDayOnly?: boolean;
  brandSpecialist?: boolean;
  instrumentSpecialist?: boolean;
  highRatedOnly?: boolean;
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["USER"]);
    const { id } = await params;
    const { regionScope, regionValue, filters }: { regionScope: string; regionValue: string; filters?: Filters } =
      await req.json();

    if (!regionScope || !regionValue) {
      return NextResponse.json({ error: "regionScope, regionValue는 필수입니다." }, { status: 400 });
    }

    const repairRequest = await prisma.repairRequest.findUnique({ where: { id } });
    if (!repairRequest || repairRequest.userId !== user.id) {
      throw new ForbiddenError();
    }

    // 같은 사용자의 다른 진행 중인 요청에 이미 매칭된 업체는 중복으로 다시
    // 매칭하지 않는다 (같은 업체에 동시에 여러 견적 요청이 몰리는 것을 방지).
    const otherActiveRequests = await prisma.repairRequest.findMany({
      where: {
        userId: user.id,
        id: { not: id },
        status: { in: ["MATCHING", "QUOTED"] },
      },
      select: { matchedCompanyIds: true },
    });
    const alreadyMatchedCompanyIds = new Set(
      otherActiveRequests.flatMap((r) => (r.matchedCompanyIds ? (JSON.parse(r.matchedCompanyIds) as string[]) : [])),
    );

    const candidates = await prisma.company.findMany({
      where: {
        status: "APPROVED",
        region: { contains: regionValue },
        id: { notIn: [...alreadyMatchedCompanyIds] },
        ...(filters?.onSiteOnly ? { onSiteVisit: true } : {}),
      },
      include: {
        services: true,
        brands: true,
        reviews: { where: { status: "VISIBLE" }, select: { rating: true } },
        estimates: { select: { status: true } },
      },
    });

    const brand = repairRequest.brand?.toLowerCase();
    const instrument = repairRequest.instrument.toLowerCase();

    const scored = candidates
      .map((c) => {
        const brandMatch = brand
          ? c.brands.some((b) => b.name.toLowerCase().includes(brand))
          : false;
        const instrumentMatch = c.services.some((s) => s.name.toLowerCase().includes(instrument));

        if (filters?.brandSpecialist && !brandMatch) return null;
        if (filters?.instrumentSpecialist && !instrumentMatch) return null;

        const reviewCount = c.reviews.length;
        const avgRating =
          reviewCount > 0 ? c.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
        const estimateTotal = c.estimates.length;
        const estimateAnswered = c.estimates.filter((e) => e.status === "ANSWERED").length;
        const responseRate = estimateTotal > 0 ? estimateAnswered / estimateTotal : 0;

        const ratingWeight = filters?.highRatedOnly ? 2 : 1;
        const score =
          (brandMatch ? 3 : 0) +
          (instrumentMatch ? 3 : 0) +
          avgRating * ratingWeight +
          responseRate * 2;

        return { id: c.id, score };
      })
      .filter((c): c is { id: string; score: number } => c !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, REPAIR_REQUEST_MAX_MATCHES);

    const matchedCompanyIds = scored.map((c) => c.id);

    const updated = await prisma.repairRequest.update({
      where: { id },
      data: {
        regionScope,
        regionValue,
        filters: filters ? JSON.stringify(filters) : null,
        matchedCompanyIds: JSON.stringify(matchedCompanyIds),
        status: "MATCHING",
      },
    });

    await Promise.all(
      matchedCompanyIds.map((companyId) =>
        notifyCompanyOwners(companyId, {
          type: "REPAIR_REQUEST_MATCHED",
          title: "새로운 수리 요청이 도착했습니다",
          link: "/partner/dashboard/repair-requests",
        }),
      ),
    );

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
