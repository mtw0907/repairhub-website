import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public company search/list JSON API — used by the mobile app. The web app
 * fetches this same data via a server component (src/app/companies/page.tsx)
 * querying Prisma directly, so this route mirrors that query's filtering and
 * scoring, kept intentionally simpler (no per-user favorite/reservation
 * status — the mobile app cross-references its own /api/favorites call for
 * that instead of a bespoke authenticated variant of this endpoint).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword")?.trim() || undefined;
  const region = searchParams.get("region")?.trim() || undefined;

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
    },
    orderBy: [{ isFeatured: "desc" }, { isPremium: "desc" }, { createdAt: "desc" }],
  });

  const results = companies.map((c) => {
    const reviewCount = c.reviews.length;
    const avgRating = reviewCount > 0 ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
    const photos: string[] = c.photos ? JSON.parse(c.photos) : [];
    const prices = c.priceItems.map((p) => p.price);
    const priceRange = prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : null;

    return {
      id: c.id,
      name: c.name,
      region: c.region,
      address: c.address,
      introduction: c.introduction,
      services: c.services.map((s) => s.name),
      brands: c.brands.map((b) => b.name),
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
      priceRange,
    };
  });

  return NextResponse.json({ companies: results });
}
