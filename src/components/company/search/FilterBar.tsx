"use client";

import { SlidersHorizontal } from "lucide-react";
import type { SearchFilters } from "@/components/company/search/FilterPanel";

const RADIUS_OPTIONS = [5, 10, 15, 20];

const TOGGLES: [keyof SearchFilters, string][] = [
  ["aiRecommendOnly", "AI 추천"],
  ["openNowOnly", "영업중"],
  ["availableTodayOnly", "당일 수리"],
  ["onSiteOnly", "출장 가능"],
  ["courierOnly", "택배 가능"],
];

export function FilterBar({
  filters,
  onChange,
  onOpenMore,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onOpenMore: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
      <select
        value={filters.radiusKm ?? ""}
        onChange={(e) =>
          onChange({ ...filters, radiusKm: e.target.value === "" ? null : Number(e.target.value) })
        }
        className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
      >
        <option value="">전국</option>
        {RADIUS_OPTIONS.map((km) => (
          <option key={km} value={km}>
            반경 {km}km
          </option>
        ))}
      </select>

      {TOGGLES.map(([key, label]) => (
        <label
          key={key}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5 has-[:checked]:text-primary dark:border-neutral-700 dark:text-neutral-300"
        >
          <input
            type="checkbox"
            checked={!!filters[key]}
            onChange={() => onChange({ ...filters, [key]: !filters[key] })}
            className="h-3.5 w-3.5 accent-primary"
          />
          {label}
        </label>
      ))}

      <button
        type="button"
        onClick={onOpenMore}
        className="ml-auto flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        필터 더보기
      </button>
    </div>
  );
}
