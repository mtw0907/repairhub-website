"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { CompanyCard, type CompanySummary } from "@/components/company/CompanyCard";
import { SORT_OPTIONS, type SortBy } from "@/components/company/search/types";

export function CompanyListPanel({
  companies,
  favoritedIds,
  isUser,
  selectedId,
  onSelect,
  selectedIds,
  onToggleCompare,
  sortBy,
  onSortChange,
  onShowAiOnly,
  aiCount,
}: {
  companies: CompanySummary[];
  favoritedIds: string[];
  isUser: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  selectedIds: string[];
  onToggleCompare: (id: string) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  onShowAiOnly: () => void;
  aiCount: number;
}) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!selectedId) return;
    cardRefs.current.get(selectedId)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500">
          업체 <span className="text-primary">{companies.length}</span>개
        </p>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
          className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-600 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {aiCount > 0 && (
        <button
          type="button"
          onClick={onShowAiOnly}
          className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-3 text-left transition-colors hover:bg-accent/15"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <span>
            <span className="block text-sm font-bold text-neutral-900 dark:text-neutral-100">
              AI 추천 {aiCount}곳
            </span>
            <span className="block text-xs text-neutral-500">AI가 분석한 최적의 업체를 확인해보세요</span>
          </span>
        </button>
      )}

      {companies.map((c) => (
        <div
          key={c.id}
          ref={(el) => {
            if (el) cardRefs.current.set(c.id, el);
            else cardRefs.current.delete(c.id);
          }}
          onMouseEnter={() => onSelect(c.id)}
          onClick={() => onSelect(c.id)}
        >
          <CompanyCard
            company={c}
            isUser={isUser}
            favorited={favoritedIds.includes(c.id)}
            showActions
            highlighted={selectedId === c.id}
            compareSlot={
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900/90 dark:text-neutral-300"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(c.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleCompare(c.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                비교
              </label>
            }
          />
        </div>
      ))}

      {companies.length === 0 && (
        <p className="py-16 text-center text-sm text-neutral-500">
          조건에 맞는 업체가 없습니다. 필터를 조정해보세요.
        </p>
      )}
    </div>
  );
}
