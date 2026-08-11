"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { REGION_SCOPES } from "@/lib/constants";

const FILTER_OPTIONS: { key: keyof Filters; label: string }[] = [
  { key: "onSiteOnly", label: "출장 가능" },
  { key: "sameDayOnly", label: "당일 수리 가능" },
  { key: "brandSpecialist", label: "브랜드 전문" },
  { key: "instrumentSpecialist", label: "악기 전문" },
  { key: "highRatedOnly", label: "높은 평점" },
];

type Filters = {
  onSiteOnly: boolean;
  sameDayOnly: boolean;
  brandSpecialist: boolean;
  instrumentSpecialist: boolean;
  highRatedOnly: boolean;
};

export function MatchSettingsForm({ repairRequestId }: { repairRequestId: string }) {
  const router = useRouter();
  const [regionScope, setRegionScope] = useState<"DONG" | "GU" | "SI">("GU");
  const [regionValue, setRegionValue] = useState("");
  const [filters, setFilters] = useState<Filters>({
    onSiteOnly: false,
    sameDayOnly: false,
    brandSpecialist: false,
    instrumentSpecialist: false,
    highRatedOnly: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/repair-requests/${repairRequestId}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regionScope, regionValue, filters }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "업체 매칭 중 오류가 발생했습니다.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
    >
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          <MapPin className="h-4 w-4 text-accent" />
          지역 기준
        </label>
        <div className="flex flex-wrap gap-2">
          {REGION_SCOPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setRegionScope(s.value)}
              className={
                regionScope === s.value
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                  : "rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:text-accent"
              }
            >
              {s.label}
            </button>
          ))}
        </div>
        <input
          required
          value={regionValue}
          onChange={(e) => setRegionValue(e.target.value)}
          placeholder="예: 서울특별시 마포구"
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-neutral-900 dark:text-neutral-100">추가 필터</label>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((f) => (
            <label
              key={f.key}
              className={
                filters[f.key]
                  ? "flex cursor-pointer items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-accent/15"
                  : "flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:text-accent"
              }
            >
              <input
                type="checkbox"
                checked={filters[f.key]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.checked }))}
                className="hidden"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-40 disabled:hover:scale-100"
      >
        {submitting ? "업체 매칭 중..." : "업체 매칭 시작하기"}
      </button>
    </form>
  );
}
