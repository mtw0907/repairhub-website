"use client";

import { KOREAN_REGIONS } from "@/lib/koreanRegions";
import { SelectMenu } from "@/components/ui/SelectMenu";
import type { CategoryTreeNode } from "@/lib/categories";
import { DEFAULT_FILTERS, type SearchFilters } from "@/components/company/search/FilterPanel";

const RATING_OPTIONS = [4.0, 4.5, 5.0];

const TOGGLES: [keyof SearchFilters, string][] = [
  ["onSiteOnly", "출장 가능"],
  ["courierOnly", "택배 가능"],
  ["availableTodayOnly", "예약 가능"],
  ["openNowOnly", "영업중"],
  ["aiRecommendOnly", "AI 추천"],
];

// 데스크톱 업체찾기 페이지의 왼쪽 25% 고정 필터 패널 — 예전 상단 FilterBar +
// 모달 FilterPanel의 내용을 하나의 상시 노출 사이드바로 합쳤다. 모바일은
// 기존 SearchBar "필터" 버튼 → FilterPanel 모달 흐름을 그대로 쓴다.
export function FilterSidebar({
  filters,
  onChange,
  categoryTree,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  categoryTree: CategoryTreeNode[];
}) {
  const districtOptions = KOREAN_REGIONS.find((r) => r.name === filters.regionSido)?.districts ?? [];

  function toggle<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-500">지역</p>
        <div className="space-y-2">
          <SelectMenu
            placeholder="전국"
            value={filters.regionSido ?? ""}
            onChange={(v) => onChange({ ...filters, regionSido: v || null, regionDistrict: null })}
            options={[{ value: "", label: "전국" }, ...KOREAN_REGIONS.map((r) => ({ value: r.name, label: r.name }))]}
          />
          <SelectMenu
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
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-500">수리 분야</p>
        <SelectMenu
          placeholder="전체 분야"
          value={filters.categorySlug ?? ""}
          onChange={(v) => onChange({ ...filters, categorySlug: v || null })}
          options={[{ value: "", label: "전체 분야" }, ...categoryTree.map((c) => ({ value: c.slug, label: c.name }))]}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-500">평점</p>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggle("minRating", r)}
              className={
                filters.minRating === r
                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300"
              }
            >
              {r.toFixed(1)}+
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-500">서비스</p>
        <div className="space-y-1">
          {TOGGLES.map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-neutral-600 transition-colors hover:bg-accent/10 hover:text-accent dark:text-neutral-300"
            >
              <input
                type="checkbox"
                checked={!!filters[key]}
                onChange={() => onChange({ ...filters, [key]: !filters[key] })}
                className="h-4 w-4 accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="w-full rounded-xl border border-neutral-200 py-2 text-xs font-medium text-neutral-600 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent dark:border-neutral-700 dark:text-neutral-300"
      >
        필터 초기화
      </button>
    </div>
  );
}
