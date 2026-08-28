import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CompareBoard, type CompareCompany } from "@/components/compare/CompareBoard";
import { CompareShareButton } from "@/components/compare/CompareShareButton";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const companyIds = (ids ?? "").split(",").filter(Boolean).slice(0, 3);

  const session = await auth();
  const isUser = session?.user?.role === "USER";

  const [companiesRaw, favorites] = await Promise.all([
    companyIds.length
      ? prisma.company.findMany({
          where: { id: { in: companyIds } },
          include: {
            services: true,
            brands: true,
            priceItems: true,
            reviews: { where: { status: "VISIBLE" }, select: { rating: true } },
          },
        })
      : Promise.resolve([]),
    isUser && companyIds.length
      ? prisma.favorite.findMany({
          where: { userId: session!.user.id, companyId: { in: companyIds } },
          select: { companyId: true },
        })
      : Promise.resolve([]),
  ]);

  const favoritedIds = new Set(favorites.map((f) => f.companyId));

  const companies: CompareCompany[] = companyIds
    .map((id, i): CompareCompany | null => {
      const c = companiesRaw.find((x) => x.id === id);
      if (!c) return null;
      const reviewCount = c.reviews.length;
      const avgRating = reviewCount > 0 ? c.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;
      const photos: string[] = c.photos ? JSON.parse(c.photos) : [];
      const photoUrl: string | null = photos[0] ?? c.logoUrl ?? null;
      return {
        id: c.id,
        rank: i + 1,
        name: c.name,
        region: c.region,
        photoUrl,
        avgRating,
        reviewCount,
        services: c.services.map((s) => s.name),
        brands: c.brands.map((b) => b.name),
        priceItems: c.priceItems.map((p) => ({ id: p.id, label: p.label, price: p.price })),
        onSiteVisit: c.onSiteVisit,
        courierDrop: c.courierDrop,
        favorited: favoritedIds.has(c.id),
      };
    })
    .filter((x): x is CompareCompany => x !== null);

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
              업체 비교
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              최대 3개 업체를 선택하여 서비스, 가격, 후기 등을 비교해보세요.
            </p>
          </div>
          {companies.length > 0 && <CompareShareButton />}
        </div>

        {companies.length < 2 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
            비교하려면{" "}
            <Link href="/companies" className="font-medium text-primary underline underline-offset-2">
              업체 검색
            </Link>
            에서 2개 이상 선택해주세요.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <CompareBoard companies={companies} isUser={isUser} />
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
