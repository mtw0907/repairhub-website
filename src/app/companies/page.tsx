import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CompanySearchView } from "@/components/company/search/CompanySearchView";
import type { CompanySummary } from "@/components/company/CompanyCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSetting } from "@/lib/systemSettings";
import { getOpenStatus, getTodaySlots } from "@/lib/businessHours";
import { haversineDistanceKm, DEFAULT_MAP_CENTER } from "@/lib/geo";
import type { ReservationStatus } from "@/lib/constants";
import { getCategoryTree } from "@/lib/categories";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; region?: string; category?: string }>;
}) {
  const { keyword, region, category } = await searchParams;
  const session = await auth();
  const isUser = session?.user?.role === "USER";

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [companies, favorites, activeReservations, kakaoMapKey, categoryTree] = await Promise.all([
    prisma.company.findMany({
      where: {
        status: "APPROVED",
        ...(keyword
          ? {
              OR: [
                { name: { contains: keyword } },
                { introduction: { contains: keyword } },
                { services: { some: { name: { contains: keyword } } } },
                { brands: { some: { name: { contains: keyword } } } },
                { categories: { some: { category: { name: { contains: keyword } } } } },
              ],
            }
          : {}),
        ...(region ? { region: { contains: region } } : {}),
      },
      include: {
        services: true,
        brands: true,
        categories: {
          include: { category: { select: { name: true, slug: true, parent: { select: { name: true, slug: true } } } } },
        },
        reviews: { where: { status: "VISIBLE" }, select: { rating: true } },
        priceItems: { select: { price: true } },
        estimates: { select: { status: true } },
        reservations: {
          where: { scheduledAt: { gte: startOfToday, lt: endOfToday } },
          select: { scheduledAt: true },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { isPremium: "desc" }, { createdAt: "desc" }],
    }),
    isUser
      ? prisma.favorite.findMany({
          where: { userId: session!.user.id },
          select: { companyId: true },
        })
      : Promise.resolve([]),
    isUser
      ? prisma.reservation.findMany({
          where: { userId: session!.user.id, status: { notIn: ["CANCELED", "COMPLETED", "NO_SHOW"] } },
          select: { companyId: true, status: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    getSetting("KAKAO_MAP_JS_KEY"),
    getCategoryTree(),
  ]);

  const favoritedIds = favorites.map((f) => f.companyId);

  const reservationByCompany = new Map<string, ReservationStatus>();
  for (const r of activeReservations) {
    if (!reservationByCompany.has(r.companyId)) {
      reservationByCompany.set(r.companyId, r.status as ReservationStatus);
    }
  }

  const scored = companies.map((c) => {
    const reviewCount = c.reviews.length;
    const avgRating =
      reviewCount > 0 ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
    const photos: string[] = c.photos ? JSON.parse(c.photos) : [];
    const prices = c.priceItems.map((p) => p.price);
    const priceRange = prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : null;

    const openStatus = getOpenStatus(c.businessHours, c.closedDays, now);
    const bookedTimes = c.reservations
      .map((r) => (r.scheduledAt ? new Date(r.scheduledAt).toTimeString().slice(0, 5) : null))
      .filter((t): t is string => t !== null);
    const todaySlots = getTodaySlots(c.businessHours, c.closedDays, bookedTimes, now);

    const estimateTotal = c.estimates.length;
    const estimateAnswered = c.estimates.filter((e) => e.status === "ANSWERED").length;
    const responseRate = estimateTotal > 0 ? estimateAnswered / estimateTotal : 0;

    const distanceFromCenter =
      c.latitude != null && c.longitude != null
        ? haversineDistanceKm(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng, c.latitude, c.longitude)
        : null;

    return {
      id: c.id,
      name: c.name,
      region: c.region,
      address: c.address,
      introduction: c.introduction,
      services: c.services.map((s) => s.name),
      brands: c.brands.map((b) => b.name),
      // 세부 품목 slug와 그 상위 대분류 slug를 함께 넣어야, 검색 필터의
      // 대분류 단위 "수리 분야" 선택(예: "drone")이 세부 품목만 선택된
      // 업체(예: "drone-body")도 정상적으로 찾아낸다.
      categorySlugs: Array.from(
        new Set(c.categories.flatMap((cc) => [cc.category.slug, cc.category.parent?.slug].filter((s): s is string => !!s))),
      ),
      categoryNames: Array.from(
        new Set(c.categories.flatMap((cc) => [cc.category.name, cc.category.parent?.name].filter((s): s is string => !!s))),
      ),
      onSiteVisit: c.onSiteVisit,
      courierDrop: c.courierDrop,
      avgRating,
      reviewCount,
      logoUrl: c.logoUrl,
      photoUrl: photos[0] ?? null,
      isPremium: c.isPremium,
      isFeatured: c.isFeatured,
      status: c.status,
      lat: c.latitude,
      lng: c.longitude,
      openStatus: openStatus.status === "UNKNOWN" ? null : openStatus,
      todaySlots,
      priceRange,
      reservationStatus: reservationByCompany.get(c.id) ?? null,
      responseRate,
      distanceFromCenter,
    };
  });

  const knownDistances = scored
    .map((c) => c.distanceFromCenter)
    .filter((d): d is number => d !== null);
  const minDistance = knownDistances.length > 0 ? Math.min(...knownDistances) : null;

  const results: CompanySummary[] = scored.map((c) => {
    const reasons: string[] = [];
    if (minDistance !== null && c.distanceFromCenter === minDistance) reasons.push("가장 가까운 업체");
    if (c.avgRating != null && c.avgRating >= 4.5) reasons.push("평점이 높은 업체");
    if (c.responseRate >= 0.7) reasons.push("응답속도가 빠른 업체");
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (c.brands.some((b) => b.toLowerCase().includes(kw))) {
        reasons.push(`${keyword} 브랜드 전문`);
      }
    }

    const { responseRate: _responseRate, distanceFromCenter: _distanceFromCenter, ...rest } = c;
    return { ...rest, aiRecommendReasons: reasons.length > 0 ? reasons : null };
  });

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100 sm:text-3xl">
          수리업체 찾기
        </h1>

        <CompanySearchView
          companies={results}
          favoritedIds={favoritedIds}
          isUser={isUser}
          kakaoMapKey={kakaoMapKey}
          initialKeyword={keyword ?? ""}
          initialCategorySlug={category ?? null}
          categoryTree={categoryTree}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
