"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  ListChecks,
  CalendarClock,
  MessageCircle,
  Star,
  Truck,
  Package,
  Clock,
  PenLine,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Info,
  Tag,
  Wrench,
  Award,
} from "lucide-react";
import { ReservationForm } from "@/components/company/ReservationForm";
import { InquiryForm } from "@/components/company/InquiryForm";
import { ReviewForm } from "@/components/company/ReviewForm";
import { ReportButton } from "@/components/ReportButton";
import { maskName } from "@/lib/format";

type TabKey = "home" | "services" | "reservation" | "estimate" | "inquiry" | "reviews";

type ReviewItem = {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: { name: string };
  photos: string[];
  partnerReply: string | null;
};

export function CompanyDetailTabs({
  companyId,
  isUser,
  introduction,
  businessHoursText,
  onSiteVisit,
  courierDrop,
  services,
  brands,
  priceItems,
  reviews,
  reviewCount,
  ownReview,
}: {
  companyId: string;
  isUser: boolean;
  introduction: string | null;
  businessHoursText: string | null;
  onSiteVisit: boolean;
  courierDrop: boolean;
  services: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  priceItems: { id: string; label: string; price: number }[];
  reviews: ReviewItem[];
  reviewCount: number;
  ownReview?: { id: string; rating: number; content: string; photos: string[] };
}) {
  const [tab, setTab] = useState<TabKey>("home");
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // 다른 페이지(비교하기, 업체 카드 등)에서 /companies/[id]#예약 같은 해시로
  // 딥링크할 때, 탭으로 감춰진 해당 섹션이 곧장 보이도록 해시를 초기 탭에 반영.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash);
    if (hash === "#예약") setTab("reservation");
    else if (hash === "#견적") setTab("estimate");
    else if (hash === "#문의") setTab("inquiry");
    else if (hash === "#가격표") setTab("home");
    else if (hash === "#리뷰") setTab("reviews");
  }, []);

  const TABS: { key: TabKey; label: string; icon: typeof Home }[] = [
    { key: "home", label: "홈", icon: Home },
    { key: "services", label: "서비스", icon: ListChecks },
    { key: "reservation", label: "예약 요청", icon: CalendarClock },
    { key: "estimate", label: "견적 요청", icon: Sparkles },
    { key: "inquiry", label: "문의하기", icon: MessageCircle },
    { key: "reviews", label: `리뷰 (${reviewCount})`, icon: Star },
  ];

  const visibleReviews = reviewsExpanded ? reviews : reviews.slice(0, 3);

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-2xl border border-neutral-200/70 bg-white p-1.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                active
                  ? "flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-bold text-primary-foreground"
                  : "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-primary/8 hover:text-primary dark:text-neutral-400 dark:hover:bg-primary/15 dark:hover:text-accent"
              }
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "home" && (
          <div className="space-y-6">
            {introduction && (
              <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Info className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">업체 소개</h2>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {introduction}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">영업 정보</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className={
                    onSiteVisit
                      ? "flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary"
                      : "flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-500 dark:bg-neutral-800"
                  }
                >
                  <Truck className="h-3.5 w-3.5" />
                  {onSiteVisit ? "출장 가능" : "출장 불가"}
                </span>
                <span
                  className={
                    courierDrop
                      ? "flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 font-medium text-accent"
                      : "flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-500 dark:bg-neutral-800"
                  }
                >
                  <Package className="h-3.5 w-3.5" />
                  {courierDrop ? "택배 가능" : "택배 불가"}
                </span>
              </div>
              {businessHoursText && (
                <p className="mt-3 flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-sm text-neutral-500 dark:border-neutral-800">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {businessHoursText}
                </p>
              )}
            </div>

            {priceItems.length > 0 && (
              <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Tag className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">가격표</h2>
                </div>
                <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-100 text-sm dark:divide-neutral-800 dark:border-neutral-800">
                  {priceItems.map((p) => (
                    <li key={p.id} className="flex justify-between px-4 py-2.5">
                      <span>{p.label}</span>
                      <span className="font-bold text-accent">
                        {p.price.toLocaleString()}원
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "services" && (
          <div className="grid gap-5 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-2">
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wrench className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">수리 품목</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {services.length > 0 ? (
                  services.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/15"
                    >
                      {s.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-neutral-400">등록된 수리 품목이 없습니다.</p>
                )}
              </div>
            </div>
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Award className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">취급 브랜드</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {brands.length > 0 ? (
                  brands.map((b) => (
                    <span
                      key={b.id}
                      className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent"
                    >
                      {b.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-neutral-400">등록된 브랜드가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "reservation" && (
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <ReservationForm
              companyId={companyId}
              isUser={isUser}
              onSiteVisit={onSiteVisit}
              courierDrop={courierDrop}
            />
          </div>
        )}

        {tab === "estimate" &&
          (isUser ? (
            <Link
              href="/dashboard/repair-requests/new"
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-8 text-center shadow-md transition-transform hover:scale-[1.01]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 text-accent-foreground">
                <Sparkles className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xl font-extrabold text-accent-foreground">AI 견적 요청</p>
                <p className="mt-1 text-sm text-accent-foreground/80">
                  증상을 입력하면 AI가 분석해 이 업체를 포함한 여러 업체의 견적을 받아보세요.
                </p>
              </div>
              <span className="mt-1 flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-primary transition-transform group-hover:translate-x-1">
                지금 시작하기
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white px-5 py-10 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                로그인하면 AI가 증상을 분석해 견적을 받아볼 수 있어요.
              </p>
              <Link
                href="/login"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90"
              >
                로그인하고 AI 견적 요청하기
              </Link>
            </div>
          ))}

        {tab === "inquiry" && (
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <InquiryForm companyId={companyId} isUser={isUser} />
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowReviewForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <PenLine className="h-4 w-4" />
              {ownReview ? "내 후기 수정" : "리뷰 쓰기"}
            </button>

            {showReviewForm && (
              <ReviewForm companyId={companyId} isUser={isUser} existingReview={ownReview} />
            )}

            {visibleReviews.length > 0 ? (
              <div className="space-y-3">
                {visibleReviews.map((r) => (
                  <div key={r.id} className="relative">
                    <div className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 rounded-[2px] bg-white dark:bg-neutral-900" />
                    <div className="relative rounded-2xl border border-l-4 border-neutral-200/70 border-l-accent bg-white p-4 text-sm shadow-sm dark:border-neutral-800 dark:border-l-accent">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {maskName(r.user.name)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5 text-accent">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5" fill={i < r.rating ? "currentColor" : "none"} />
                            ))}
                          </span>
                          <ReportButton targetType="REVIEW" targetId={r.id} isUser={isUser} />
                        </div>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-neutral-700 dark:text-neutral-300">{r.content}</p>
                      {r.photos.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {r.photos.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={url} src={url} alt="후기 사진" className="h-20 w-20 rounded-lg object-cover" />
                          ))}
                        </div>
                      )}
                      {r.partnerReply && (
                        <div className="mt-3 rounded-xl bg-surface-muted p-3 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          <p className="mb-1 text-xs font-bold">업체 답글</p>
                          {r.partnerReply}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-500">
                아직 등록된 후기가 없습니다.
              </p>
            )}

            {!reviewsExpanded && reviews.length > 3 && (
              <button
                type="button"
                onClick={() => setReviewsExpanded(true)}
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-surface-muted dark:border-neutral-700 dark:text-neutral-300"
              >
                리뷰 더보기 <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
