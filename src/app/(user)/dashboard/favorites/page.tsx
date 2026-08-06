import Link from "next/link";
import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";
import { CompanyCard, type CompanySummary } from "@/components/company/CompanyCard";

export default async function FavoritesPage() {
  const session = await auth();
  const favorites = await prisma.favorite.findMany({
    where: { userId: session!.user.id },
    include: {
      company: {
        include: {
          services: true,
          brands: true,
          reviews: { where: { status: "VISIBLE" }, select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const companies: CompanySummary[] = favorites.map(({ company: c }) => {
    const reviewCount = c.reviews.length;
    const avgRating =
      reviewCount > 0 ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
    const photos: string[] = c.photos ? JSON.parse(c.photos) : [];
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
      logoUrl: c.logoUrl,
      photoUrl: photos[0] ?? null,
      isPremium: c.isPremium,
      isFeatured: c.isFeatured,
      status: c.status,
    };
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          <Heart className="h-6 w-6 fill-accent text-accent" />
          찜한 업체
        </h1>
        {companies.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <CompanyCard key={c.id} company={c} isUser favorited />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
            아직 찜한 업체가 없습니다.{" "}
            <Link href="/companies" className="font-medium text-primary underline underline-offset-2">
              업체 찾기
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
