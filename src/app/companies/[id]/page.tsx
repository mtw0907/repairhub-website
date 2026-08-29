import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Wrench, MapPin, Phone, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FavoriteButton } from "@/components/company/FavoriteButton";
import { RecordRecentView } from "@/components/company/RecordRecentView";
import { RecordCompanyView } from "@/components/company/RecordCompanyView";
import { CompanyDetailTabs } from "@/components/company/CompanyDetailTabs";
import { ReportButton } from "@/components/ReportButton";
import { formatBusinessHours } from "@/lib/businessHours";
import { getCategoryTree } from "@/lib/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return {};

  const description =
    company.seoDescription ||
    company.introduction ||
    `${company.name} - ${company.region ?? ""} 음향기기·악기 수리업체. 소리수리에서 예약과 견적을 받아보세요.`;
  const title = `${company.name}${company.region ? ` - ${company.region}` : ""} 음향기기·악기 수리 | 소리수리`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: company.logoUrl ? [company.logoUrl] : undefined,
    },
  };
}

function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      services: true,
      brands: true,
      priceItems: true,
      categories: {
        include: { category: { select: { name: true, icon: true, parent: { select: { icon: true } } } } },
      },
      reviews: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!company || company.status === "SUSPENDED") {
    notFound();
  }

  const session = await auth();
  const isUser = session?.user?.role === "USER";

  const [favorite, ownReview, categoryTree, devices] = await Promise.all([
    isUser
      ? prisma.favorite.findUnique({
          where: { userId_companyId: { userId: session!.user.id, companyId: company.id } },
        })
      : null,
    isUser
      ? prisma.review.findFirst({ where: { userId: session!.user.id, companyId: company.id } })
      : null,
    getCategoryTree(),
    isUser
      ? prisma.userDevice.findMany({
          where: { userId: session!.user.id },
          select: { id: true, name: true },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  const reviewCount = company.reviews.length;
  const avgRating =
    reviewCount > 0 ? company.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;
  const photos: string[] = company.photos ? JSON.parse(company.photos) : [];
  const isVerified = company.status === "APPROVED";
  // "수리 가능 장비" 표시용 — 세부 품목은 자체 아이콘이 없어 상위 대분류
  // 아이콘을 물려받는다 (src/lib/categories.ts CATEGORY_ICON_MAP 참고).
  const assignedCategories = company.categories.map((cc) => ({
    name: cc.category.name,
    icon: cc.category.parent?.icon ?? cc.category.icon,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    ...(company.logoUrl ? { image: company.logoUrl } : {}),
    ...(company.phone ? { telephone: company.phone } : {}),
    address: {
      "@type": "PostalAddress",
      ...(company.address ? { streetAddress: company.address } : {}),
      ...(company.region ? { addressRegion: company.region } : {}),
      addressCountry: "KR",
    },
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <SiteHeader />
      <RecordCompanyView companyId={company.id} />
      {isUser && <RecordRecentView companyId={company.id} />}

      {/* 대표 사진 배너 */}
      <div className="relative h-48 w-full overflow-hidden sm:h-64">
        {photos[0] || company.logoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[0] ?? company.logoUrl ?? undefined}
              alt={company.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-muted">
            <Wrench className="h-16 w-16 text-primary/20" />
          </div>
        )}
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 sm:px-6">
        <div className="-mt-14 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-white p-5 shadow-lg dark:border-primary/25 dark:bg-neutral-900 sm:-mt-16 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-xl font-bold text-primary ring-4 ring-white dark:ring-neutral-900">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                company.name.slice(0, 1)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                  {company.name}
                </h1>
                {isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                    인증업체
                  </span>
                )}
                {company.isFeatured && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    추천
                  </span>
                )}
                {company.isPremium && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    프리미엄
                  </span>
                )}
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {company.address ?? company.region}
              </p>
              {company.phone && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {company.phone}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1 text-sm">
                {avgRating ? (
                  <span className="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-100">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {avgRating.toFixed(1)}
                    <span className="font-normal text-neutral-500">(후기 {reviewCount}개)</span>
                  </span>
                ) : (
                  <span className="text-neutral-500">아직 후기가 없습니다</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
            <FavoriteButton
              companyId={company.id}
              initialFavorited={Boolean(favorite)}
              isUser={isUser}
            />
            <ReportButton targetType="COMPANY" targetId={company.id} isUser={isUser} />
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`${company.name} 사진`}
                className="h-28 w-28 shrink-0 rounded-xl object-cover transition-transform hover:scale-105"
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <CompanyDetailTabs
            companyId={company.id}
            isUser={isUser}
            categoryTree={categoryTree}
            assignedCategories={assignedCategories}
            devices={devices}
            introduction={company.introduction}
            businessHoursText={formatBusinessHours(company.businessHours, company.closedDays)}
            onSiteVisit={company.onSiteVisit}
            courierDrop={company.courierDrop}
            services={company.services}
            brands={company.brands}
            priceItems={company.priceItems}
            reviewCount={reviewCount}
            reviews={company.reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              content: r.content,
              createdAt: r.createdAt.toISOString(),
              user: { name: r.user.name },
              photos: r.photos ? JSON.parse(r.photos) : [],
              partnerReply: r.partnerReply,
            }))}
            ownReview={
              ownReview
                ? {
                    id: ownReview.id,
                    rating: ownReview.rating,
                    content: ownReview.content,
                    photos: ownReview.photos ? JSON.parse(ownReview.photos) : [],
                  }
                : undefined
            }
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
