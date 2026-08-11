"use client";

import { Locate, SlidersHorizontal, Search, ZoomIn } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  onLocate,
  onOpenFilters,
  onZoomIn,
  activeFilterCount,
}: {
  value: string;
  onChange: (value: string) => void;
  onLocate: () => void;
  onOpenFilters: () => void;
  onZoomIn: () => void;
  activeFilterCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Search className="h-4.5 w-4.5 shrink-0 text-neutral-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="악기, 브랜드, 업체명을 검색하세요."
          className="w-full min-w-0 border-0 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
        />
      </div>
      <button
        type="button"
        onClick={onLocate}
        title="현재 위치"
        className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 text-xs font-semibold text-neutral-600 shadow-sm transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
      >
        <Locate className="h-4 w-4" />
        <span className="hidden sm:inline">내 위치</span>
      </button>
      <button
        type="button"
        onClick={onOpenFilters}
        title="필터"
        className="relative flex shrink-0 items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 text-xs font-semibold text-neutral-600 shadow-sm transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">필터</span>
        {activeFilterCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
            {activeFilterCount}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        title="지도 확대"
        className="hidden shrink-0 items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 text-xs font-semibold text-neutral-600 shadow-sm transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 sm:flex"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
    </div>
  );
}
