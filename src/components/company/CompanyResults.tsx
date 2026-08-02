"use client";

import { useState } from "react";
import Link from "next/link";

type CompanySummary = {
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
  isPremium?: boolean;
  isFeatured?: boolean;
};

export function CompanyResults({ companies }: { companies: CompanySummary[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
          ? prev
          : [...prev, id],
    );
  }

  return (
    <div className="relative pb-16">
      <div className="grid gap-4 sm:grid-cols-2">
        {companies.map((c) => (
          <div
            key={c.id}
            className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-sm font-semibold text-neutral-400 dark:bg-neutral-800">
                  {c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logoUrl} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    c.name.slice(0, 1)
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/companies/${c.id}`}
                      className="text-base font-semibold text-neutral-900 group-hover:text-brand dark:text-neutral-100"
                    >
                      {c.name}
                    </Link>
                    {c.isFeatured && (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                        추천
                      </span>
                    )}
                    {c.isPremium && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        프리미엄
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">{c.region ?? c.address}</p>
                </div>
              </div>
              <label className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-500">
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() => toggle(c.id)}
                />
                비교
              </label>
            </div>

            {c.introduction && (
              <p className="mt-3 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                {c.introduction}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.services.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800">
              <span className={c.avgRating ? "font-medium text-amber-600 dark:text-amber-400" : ""}>
                {c.avgRating ? `★ ${c.avgRating.toFixed(1)} (${c.reviewCount})` : "후기 없음"}
              </span>
              <span>
                {c.onSiteVisit ? "출장 가능" : ""} {c.courierDrop ? "택배 가능" : ""}
              </span>
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <p className="col-span-2 py-12 text-center text-sm text-neutral-500">
            검색 결과가 없습니다.
          </p>
        )}
      </div>

      {selected.length >= 2 && (
        <div className="fixed inset-x-0 bottom-0 flex justify-center pb-4">
          <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-5 py-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              {selected.length}개 선택됨
            </span>
            <Link
              href={`/compare?ids=${selected.join(",")}`}
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
            >
              비교하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
