"use client";

import Link from "next/link";
import { Clock, MapPin, Star, X } from "lucide-react";
import type { CompanySummary } from "@/components/company/CompanyCard";

export function CompanyFloatingCard({
  company,
  onClose,
}: {
  company: CompanySummary;
  onClose: () => void;
}) {
  const photo = company.photoUrl ?? company.logoUrl ?? null;

  return (
    <div className="pointer-events-auto w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:w-80">
      <div className="flex items-start gap-3 p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-accent/15">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={company.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary/25">
              {company.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {company.name}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-0.5 text-neutral-400 hover:border-accent/50 hover:bg-accent/10 hover:text-accent dark:hover:border-accent/40 dark:hover:bg-accent/15 dark:hover:text-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {company.avgRating ? company.avgRating.toFixed(1) : "신규"}
            {company.reviewCount > 0 && ` (${company.reviewCount})`}
          </p>
          {(company.distanceLabel || company.region) && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {company.distanceLabel ? `${company.distanceLabel} · ` : ""}
              {company.region}
            </p>
          )}
          {company.openStatus?.label && (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Clock className="h-3 w-3" />
              {company.openStatus.label}
            </p>
          )}
        </div>
      </div>

      {company.priceRange && (
        <p className="border-t border-neutral-100 px-3 py-2 text-xs text-neutral-500 dark:border-neutral-800">
          예상 수리비 {company.priceRange.min.toLocaleString()}원 ~{" "}
          {company.priceRange.max.toLocaleString()}원
        </p>
      )}

      <div className="flex gap-2 border-t border-neutral-100 p-3 dark:border-neutral-800">
        <Link
          href={`/companies/${company.id}#예약`}
          className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground transition-transform hover:scale-105 hover:bg-primary/90"
        >
          예약하기
        </Link>
        <Link
          href="/dashboard/repair-requests/new"
          className="flex-1 rounded-xl border border-accent/60 py-2 text-center text-xs font-bold text-accent-foreground/80 transition-colors hover:bg-accent/10 dark:text-accent dark:hover:bg-accent/15"
        >
          AI 견적
        </Link>
        <Link
          href={`/companies/${company.id}`}
          className="flex-1 rounded-xl border border-neutral-200 py-2 text-center text-xs font-bold text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:text-accent"
        >
          상세보기
        </Link>
      </div>
    </div>
  );
}
