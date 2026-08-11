"use client";

import { X } from "lucide-react";

export type SearchFilters = {
  radiusKm: number | null; // null = 전국
  minRating: number | null;
  onSiteOnly: boolean;
  courierOnly: boolean;
  availableTodayOnly: boolean;
  openNowOnly: boolean;
  aiRecommendOnly: boolean;
};

export const DEFAULT_FILTERS: SearchFilters = {
  radiusKm: null,
  minRating: null,
  onSiteOnly: false,
  courierOnly: false,
  availableTodayOnly: false,
  openNowOnly: false,
  aiRecommendOnly: false,
};

export function countActiveFilters(f: SearchFilters): number {
  let n = 0;
  if (f.radiusKm !== null) n++;
  if (f.minRating !== null) n++;
  if (f.onSiteOnly) n++;
  if (f.courierOnly) n++;
  if (f.availableTodayOnly) n++;
  if (f.openNowOnly) n++;
  if (f.aiRecommendOnly) n++;
  return n;
}

const RADIUS_OPTIONS = [5, 10, 15, 20];
const RATING_OPTIONS = [4.0, 4.5, 5.0];

export function FilterPanel({
  open,
  filters,
  onChange,
  onClose,
}: {
  open: boolean;
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  function toggle<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-neutral-900 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">필터</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:border-primary/30 hover:bg-primary/8 hover:text-primary dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">거리</p>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => toggle("radiusKm", km)}
                  className={
                    filters.radiusKm === km
                      ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105"
                      : "rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:text-accent"
                  }
                >
                  {km}km
                </button>
              ))}
              <button
                type="button"
                onClick={() => onChange({ ...filters, radiusKm: null })}
                className={
                  filters.radiusKm === null
                    ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105"
                    : "rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:text-accent"
                }
              >
                전국
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">평점</p>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggle("minRating", r)}
                  className={
                    filters.minRating === r
                      ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105"
                      : "rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:text-accent"
                  }
                >
                  {r.toFixed(1)}+
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">서비스</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["onSiteOnly", "출장 가능"],
                  ["courierOnly", "택배 가능"],
                  ["availableTodayOnly", "예약 가능"],
                  ["openNowOnly", "영업중"],
                  ["aiRecommendOnly", "AI 추천"],
                ] as [keyof SearchFilters, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ ...filters, [key]: !filters[key] })}
                  className={
                    filters[key]
                      ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105"
                      : "rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:text-accent"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:border-primary/40 hover:bg-primary/8 hover:text-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:bg-primary/15 dark:hover:text-accent"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] hover:bg-primary/90"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
