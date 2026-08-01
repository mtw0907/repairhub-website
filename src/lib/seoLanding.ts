import { prisma } from "@/lib/prisma";

export type SeoLandingType = "REGION" | "BRAND" | "SYMPTOM";

export async function getSeoLandingData(type: SeoLandingType, keyword: string) {
  const seoPage = await prisma.seoPage.findUnique({
    where: { type_keyword: { type, keyword } },
  });
  if (!seoPage) return null;

  const where =
    type === "REGION"
      ? { region: { contains: keyword }, status: "APPROVED" as const }
      : type === "BRAND"
        ? { brands: { some: { name: { contains: keyword } } }, status: "APPROVED" as const }
        : { services: { some: { name: { contains: keyword } } }, status: "APPROVED" as const };

  const companies = await prisma.company.findMany({
    where,
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

  return { seoPage, results };
}
