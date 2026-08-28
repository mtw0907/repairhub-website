"use client";

import { SlidersHorizontal } from "lucide-react";
import type { SearchFilters } from "@/components/company/search/FilterPanel";
import { KOREAN_REGIONS } from "@/lib/koreanRegions";
import { SelectMenu } from "@/components/ui/SelectMenu";
import type { CategoryTreeNode } from "@/lib/categories";

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
  categoryTree,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onOpenMore: () => void;
  categoryTree: CategoryTreeNode[];
}) {
  const districtOptions = KOREAN_REGIONS.find((r) => r.name === filters.regionSido)?.districts ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
      <div className="w-24">
        <SelectMenu
          compact
          placeholder="전국"
          value={filters.regionSido ?? ""}
          onChange={(v) => onChange({ ...filters, regionSido: v || null, regionDistrict: null })}
          options={[
            { value: "", label: "전국" },
            ...KOREAN_REGIONS.map((r) => ({ value: r.name, label: r.name })),
          ]}
        />
      </div>
      <div className="w-28">
        <SelectMenu
          compact
          placeholder="구/군/시"
          value={filters.regionDistrict ?? ""}
          onChange={(v) => onChange({ ...filters, regionDistrict: v || null })}
          disabled={!filters.regionSido || districtOptions.length === 0}
          options={[
            { value: "", label: filters.regionSido ? `${filters.regionSido} 전체` : "구/군/시" },
            ...districtOptions.map((d) => ({ value: d, label: d })),
          ]}
        />
      </div>
      <div className="w-28">
        <SelectMenu
          compact
          placeholder="수리 분야"
          value={filters.categorySlug ?? ""}
          onChange={(v) => onChange({ ...filters, categorySlug: v || null })}
          options={[
            { value: "", label: "전체 분야" },
            ...categoryTree.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </div>

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
