"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { KOREAN_REGIONS } from "@/lib/koreanRegions";
import { SelectMenu } from "@/components/ui/SelectMenu";

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
  const [sido, setSido] = useState("");
  const [district, setDistrict] = useState(""); // 빈 값 = 시/도 전체
  const selectedRegion = KOREAN_REGIONS.find((r) => r.name === sido);
  // Company.region은 자유 텍스트라, 구/군/시가 있으면 그 이름만(예: "마포구")
  // 매칭 조건으로 써야 표기 방식이 달라도("서울특별시 마포구" 등) 안정적으로 걸린다.
  const regionValue = district || sido;
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
      body: JSON.stringify({ regionScope: "GU", regionValue, filters }),
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
        <div className="grid grid-cols-2 gap-2">
          <SelectMenu
            placeholder="시/도 선택"
            value={sido}
            onChange={(v) => {
              setSido(v);
              setDistrict("");
            }}
            options={KOREAN_REGIONS.map((r) => ({ value: r.name, label: r.name }))}
          />
          <SelectMenu
            placeholder="구/군/시 선택"
            value={district}
            onChange={setDistrict}
            disabled={!sido || !selectedRegion?.districts.length}
            options={[
              { value: "", label: sido ? `${sido} 전체` : "구/군/시 선택" },
              ...(selectedRegion?.districts.map((d) => ({ value: d, label: d })) ?? []),
            ]}
          />
        </div>
        {sido && (
          <p className="mt-1.5 text-xs text-neutral-400">
            선택된 지역: {sido} {district || "전체"}
          </p>
        )}
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
        disabled={submitting || !sido}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-40 disabled:hover:scale-100"
      >
        {submitting ? "업체 매칭 중..." : "업체 매칭 시작하기"}
      </button>
    </form>
  );
}
