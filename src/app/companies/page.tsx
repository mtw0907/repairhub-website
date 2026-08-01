import { SiteHeader } from "@/components/SiteHeader";
import { CompanyResults } from "@/components/company/CompanyResults";
import { prisma } from "@/lib/prisma";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; region?: string }>;
}) {
  const { keyword, region } = await searchParams;

  const companies = await prisma.company.findMany({
    where: {
      status: "APPROVED",
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { introduction: { contains: keyword } },
              { services: { some: { name: { contains: keyword } } } },
              { brands: { some: { name: { contains: keyword } } } },
            ],
          }
        : {}),
      ...(region ? { region: { contains: region } } : {}),
    },
    include: {
      services: true,
      brands: true,
      reviews: { where: { status: "VISIBLE" }, select: { rating: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { isPremium: "desc" }, { createdAt: "desc" }],
  });

  const results = companies.map((c) => {
    const reviewCount = c.reviews.length;
    const avgRating =
      reviewCount > 0 ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
    return {
      id: c.id,
      name: c.name,
      region: c.region,
      address: c.address,
      introduction: c.introduction,
      services: c.services.map((s) => s.name),
      brands: c.brands.map((b) => b.name),
      onSiteVisit: c.onSiteVisit,
      courierDrop: c.courierDrop,
      avgRating,
      reviewCount,
    };
  });

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          수리업체 검색
        </h1>

        <form className="mb-6 flex flex-wrap gap-2">
          <input
            type="text"
            name="keyword"
            defaultValue={keyword}
            placeholder="업체명, 브랜드, 서비스로 검색"
            className="flex-1 min-w-[200px] rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input
            type="text"
            name="region"
            defaultValue={region}
            placeholder="지역 (예: 서울특별시)"
            className="w-48 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            검색
          </button>
        </form>

        <p className="mb-4 text-sm text-neutral-500">총 {results.length}개 업체</p>

        <CompanyResults companies={results} />
      </main>
    </div>
  );
}
