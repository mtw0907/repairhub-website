import Link from "next/link";
import { BadgeCheck, Clock, MapPin, Star, Truck } from "lucide-react";
import { FavoriteButton } from "@/components/company/FavoriteButton";
import { AiRecommendBadge } from "@/components/company/AiRecommendBadge";
import {
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_STYLE,
  type ReservationStatus,
} from "@/lib/constants";

export type CompanySummary = {
  id: string;
  name: string;
  region: string | null;
  address: string | null;
  introduction: string | null;
  services: string[];
  brands: string[];
  onSiteVisit: boolean;
  courierDrop: boolean;
  avgRating: number | null;
  reviewCount: number;
  logoUrl?: string | null;
  photoUrl?: string | null;
  isPremium?: boolean;
  isFeatured?: boolean;
  status?: string;
  // Map/search page extras — all optional so existing callers (home, favorites) are unaffected.
  lat?: number | null;
  lng?: number | null;
  distanceLabel?: string | null;
  openStatus?: {
    status: "OPEN" | "CLOSED" | "HOLIDAY" | "UNKNOWN";
    label: string;
    closesAt?: string;
  } | null;
  todaySlots?: string[];
  aiRecommendReasons?: string[] | null;
  reservationStatus?: ReservationStatus | null;
  priceRange?: { min: number; max: number } | null;
};

const OPEN_STATUS_STYLE: Record<string, string> = {
  OPEN: "text-emerald-600 dark:text-emerald-400",
  CLOSED: "text-neutral-400",
  HOLIDAY: "text-neutral-400",
  UNKNOWN: "text-neutral-400",
};

export function CompanyCard({
  company,
  isUser,
  favorited,
  compareSlot,
  showActions,
  highlighted,
  compact,
}: {
  company: CompanySummary;
  isUser: boolean;
  favorited: boolean;
  compareSlot?: React.ReactNode;
  /** Renders 예약하기/AI 견적 요청 buttons below the card (map/search page only). */
  showActions?: boolean;
  /** Visually emphasizes the card, e.g. when its map pin is selected. */
  highlighted?: boolean;
  /** Tighter padding/text + fewer secondary details, for narrow 3-up rows (home page). */
  compact?: boolean;
}) {
  const photo = company.photoUrl ?? company.logoUrl ?? null;
  const isVerified = company.status === "APPROVED";

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        highlighted
          ? "border-primary ring-2 ring-primary/30"
          : "border-neutral-200/70 dark:border-neutral-800"
      }`}
    >
      <Link href={`/companies/${company.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/15">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={company.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary/25">
              {company.name.slice(0, 1)}
            </div>
          )}

          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {company.aiRecommendReasons && company.aiRecommendReasons.length > 0 && (
              <AiRecommendBadge reasons={company.aiRecommendReasons} />
            )}
            {isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-primary shadow-sm dark:bg-neutral-900/95">
                <BadgeCheck className="h-3 w-3 text-accent" />
                인증업체
              </span>
            )}
            {company.isFeatured && (
              <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
                추천
              </span>
            )}
            {company.isPremium && (
              <span className="rounded-full bg-accent px-2 py-1 text-[11px] font-semibold text-accent-foreground shadow-sm">
                프리미엄
              </span>
            )}
          </div>

          <div className="absolute right-2.5 top-2.5">
            <FavoriteButton
              companyId={company.id}
              initialFavorited={favorited}
              isUser={isUser}
              variant="icon"
            />
          </div>

          {compareSlot && <div className="absolute bottom-2.5 right-2.5">{compareSlot}</div>}
        </div>

        <div className={compact ? "flex flex-1 flex-col gap-1.5 p-3" : "flex flex-1 flex-col gap-2.5 p-4"}>
          <div className="flex items-start justify-between gap-2">
            <h3
              className={
                compact
                  ? "text-sm font-bold leading-snug text-neutral-900 group-hover:text-accent dark:text-neutral-100"
                  : "text-base font-bold leading-snug text-neutral-900 group-hover:text-accent dark:text-neutral-100"
              }
            >
              {company.name}
            </h3>
            <span
              className={
                company.avgRating
                  ? "flex shrink-0 items-center gap-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100"
                  : "flex shrink-0 items-center gap-1 text-xs text-neutral-400"
              }
            >
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {company.avgRating ? company.avgRating.toFixed(1) : "신규"}
              {company.reviewCount > 0 && (
                <span className="font-normal text-neutral-400">({company.reviewCount})</span>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            {(company.region || company.address) && (
              <span className="flex min-w-0 items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {company.distanceLabel ? `${company.distanceLabel} · ` : ""}
                  {company.region ?? company.address}
                </span>
              </span>
            )}
            {company.openStatus?.label && (
              <span
                className={`flex shrink-0 items-center gap-1 font-medium ${OPEN_STATUS_STYLE[company.openStatus.status]}`}
              >
                <Clock className="h-3.5 w-3.5" />
                {company.openStatus.label}
                {company.openStatus.closesAt && (
                  <span className="text-neutral-400">· {company.openStatus.closesAt}까지</span>
                )}
              </span>
            )}
          </div>

          {company.reservationStatus && (
            <span
              className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${RESERVATION_STATUS_STYLE[company.reservationStatus]}`}
            >
              {RESERVATION_STATUS_LABEL[company.reservationStatus]}
            </span>
          )}

          {company.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {company.services.slice(0, compact ? 2 : 3).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {company.todaySlots && company.todaySlots.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                오늘 예약 가능
              </span>
              {company.todaySlots.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-neutral-200 px-2 py-0.5 dark:border-neutral-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {company.priceRange && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              예상 수리비 {company.priceRange.min.toLocaleString()}원 ~{" "}
              {company.priceRange.max.toLocaleString()}원
            </p>
          )}

          {company.onSiteVisit && (
            <p className="mt-auto flex items-center gap-1 pt-1 text-[11px] font-medium text-primary/80 dark:text-neutral-300">
              <Truck className="h-3.5 w-3.5" />
              출장 가능
            </p>
          )}
        </div>
      </Link>

      {showActions && (
        <div className="flex gap-2 border-t border-neutral-100 p-3 dark:border-neutral-800">
          <Link
            href={`/companies/${company.id}#예약`}
            className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            예약하기
          </Link>
          <Link
            href="/dashboard/repair-requests/new"
            className="flex-1 rounded-xl border border-accent/60 py-2 text-center text-xs font-bold text-accent-foreground/80 transition-colors hover:bg-accent/10 dark:text-accent"
          >
            AI 견적 요청
          </Link>
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              companyId={company.id}
              initialFavorited={favorited}
              isUser={isUser}
              variant="icon"
            />
          </div>
        </div>
      )}
    </div>
  );
}
