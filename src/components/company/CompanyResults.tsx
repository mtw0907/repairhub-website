"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Scale, X } from "lucide-react";
import { CompanyCard, type CompanySummary } from "@/components/company/CompanyCard";

export function CompanyResults({
  companies,
  favoritedIds,
  isUser,
}: {
  companies: CompanySummary[];
  favoritedIds: string[];
  isUser: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 3
          ? prev
          : [...prev, id],
    );
  }

  return (
    <div className="relative pb-16">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <CompanyCard
            key={c.id}
            company={c}
            isUser={isUser}
            favorited={favoritedIds.includes(c.id)}
            compareSlot={
              <label
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900/90 dark:text-neutral-300"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggle(c.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                비교
              </label>
            }
          />
        ))}

        {companies.length === 0 && (
          <p className="col-span-full py-16 text-center text-sm text-neutral-500">
            검색 결과가 없습니다.
          </p>
        )}
      </div>

      {selected.length >= 2 && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-6 sm:pb-8">
          <div className="compare-bar-enter flex w-full max-w-xl items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white/95 py-3 pl-5 pr-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95 sm:py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Scale className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {selected.length}개 업체 선택됨
                </p>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="flex items-center gap-0.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="h-3 w-3" />
                  선택 해제
                </button>
              </div>
            </div>
            <Link
              href={`/compare?ids=${selected.join(",")}`}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-md transition-transform hover:scale-105 sm:px-6 sm:text-base"
            >
              비교하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
