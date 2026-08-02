import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { FavoriteButton } from "@/components/company/FavoriteButton";
import { RecordRecentView } from "@/components/company/RecordRecentView";
import { RecordCompanyView } from "@/components/company/RecordCompanyView";
import { ReservationForm } from "@/components/company/ReservationForm";
import { EstimateForm } from "@/components/company/EstimateForm";
import { InquiryForm } from "@/components/company/InquiryForm";
import { ReviewForm } from "@/components/company/ReviewForm";
import { ReportButton } from "@/components/ReportButton";

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
    `${company.name} - ${company.region ?? ""} 음향기기·악기 수리업체. RepairHub에서 예약과 견적을 받아보세요.`;
  const title = `${company.name}${company.region ? ` - ${company.region}` : ""} 음향기기·악기 수리 | RepairHub`;

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

  const [favorite, ownReview] = await Promise.all([
    isUser
      ? prisma.favorite.findUnique({
          where: { userId_companyId: { userId: session!.user.id, companyId: company.id } },
        })
      : null,
    isUser
      ? prisma.review.findFirst({ where: { userId: session!.user.id, companyId: company.id } })
      : null,
  ]);

  const reviewCount = company.reviews.length;
  const avgRating =
    reviewCount > 0 ? company.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;

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
    <div className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <SiteHeader />
      <RecordCompanyView companyId={company.id} />
      {isUser && <RecordRecentView companyId={company.id} />}

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-xl font-semibold text-neutral-400 dark:bg-neutral-800">
              {company.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                company.name.slice(0, 1)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  {company.name}
                </h1>
                {company.isFeatured && (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                    추천
                  </span>
                )}
                {company.isPremium && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    프리미엄
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-500">{company.address ?? company.region}</p>
              <p className="mt-1 text-sm text-neutral-500">{company.phone}</p>
              <p className="mt-2 text-sm">
                {avgRating ? (
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    ★ {avgRating.toFixed(1)}{" "}
                    <span className="font-normal text-neutral-500">(후기 {reviewCount}개)</span>
                  </span>
                ) : (
                  <span className="text-neutral-500">아직 후기가 없습니다</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <FavoriteButton
              companyId={company.id}
              initialFavorited={Boolean(favorite)}
              isUser={isUser}
            />
            <ReportButton targetType="COMPANY" targetId={company.id} isUser={isUser} />
          </div>
        </div>

        {company.introduction && (
          <p className="mt-6 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
            {company.introduction}
          </p>
        )}

        {company.photos && JSON.parse(company.photos).length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {(JSON.parse(company.photos) as string[]).map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`${company.name} 사진`}
                className="h-28 w-28 shrink-0 rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                수리 품목
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {company.services.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                취급 브랜드
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {company.brands.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {b.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {company.priceItems.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                가격표
              </h2>
              <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-100 text-sm dark:divide-neutral-800 dark:border-neutral-800">
                {company.priceItems.map((p) => (
                  <li key={p.id} className="flex justify-between px-4 py-2">
                    <span>{p.label}</span>
                    <span className="font-medium">{p.price.toLocaleString()}원</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span
              className={
                company.onSiteVisit
                  ? "rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-500 dark:bg-neutral-800"
              }
            >
              {company.onSiteVisit ? "출장 가능" : "출장 불가"}
            </span>
            <span
              className={
                company.courierDrop
                  ? "rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-500 dark:bg-neutral-800"
              }
            >
              {company.courierDrop ? "택배 가능" : "택배 불가"}
            </span>
          </div>

          {(company.businessHours || company.closedDays) && (
            <div className="mt-4 space-y-0.5 text-sm text-neutral-500">
              {company.businessHours && <p>영업시간: {company.businessHours}</p>}
              {company.closedDays && <p>휴무일: {company.closedDays}</p>}
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              예약 요청
            </h2>
            <ReservationForm companyId={company.id} isUser={isUser} />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              견적 요청
            </h2>
            <EstimateForm companyId={company.id} isUser={isUser} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            문의하기
          </h2>
          <InquiryForm companyId={company.id} isUser={isUser} />
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {ownReview ? "내 후기 수정" : "후기 작성"}
          </h2>
          <ReviewForm
            companyId={company.id}
            isUser={isUser}
            existingReview={
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
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            후기 ({reviewCount})
          </h2>
          <div className="space-y-4">
            {company.reviews.map((r) => {
              const photos: string[] = r.photos ? JSON.parse(r.photos) : [];
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {r.user.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                      <ReportButton targetType="REVIEW" targetId={r.id} isUser={isUser} />
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                    {r.content}
                  </p>
                  {photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {photos.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={url} src={url} alt="후기 사진" className="h-20 w-20 rounded object-cover" />
                      ))}
                    </div>
                  )}
                  {r.partnerReply && (
                    <div className="mt-3 rounded-md bg-neutral-50 p-3 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      <p className="mb-1 text-xs font-semibold">업체 답글</p>
                      {r.partnerReply}
                    </div>
                  )}
                </div>
              );
            })}
            {reviewCount === 0 && (
              <p className="text-sm text-neutral-500">아직 등록된 후기가 없습니다.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
