"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Truck, Clock, CalendarCheck } from "lucide-react";

export type QuoteSummary = {
  id: string;
  price: number;
  duration: string;
  availableDate: string | null;
  onSiteAvailable: boolean;
  message: string | null;
  company: {
    id: string;
    name: string;
    avgRating: number | null;
    reviewCount: number;
    services: string[];
  };
};

type SortKey = "price" | "rating" | "fastest";

const SORTERS: Record<SortKey, (a: QuoteSummary, b: QuoteSummary) => number> = {
  price: (a, b) => a.price - b.price,
  rating: (a, b) => (b.company.avgRating ?? 0) - (a.company.avgRating ?? 0),
  fastest: (a, b) => {
    if (!a.availableDate && !b.availableDate) return 0;
    if (!a.availableDate) return 1;
    if (!b.availableDate) return -1;
    return new Date(a.availableDate).getTime() - new Date(b.availableDate).getTime();
  },
};

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: "price", label: "가격순" },
  { key: "rating", label: "평점순" },
  { key: "fastest", label: "빠른예약순" },
];

export function QuoteCompareList({ quotes }: { quotes: QuoteSummary[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => [...quotes].sort(SORTERS[sortKey]), [quotes, sortKey]);

  async function handleReserve(quoteId: string) {
    setReservingId(quoteId);
    setError(null);
    const res = await fetch(`/api/quotes/${quoteId}/reserve`, { method: "POST" });
    setReservingId(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "예약 처리 중 오류가 발생했습니다.");
    }
  }

  if (quotes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
        아직 도착한 견적이 없습니다. 매칭된 업체가 견적을 제출하면 여기에 표시됩니다.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {SORT_LABELS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSortKey(s.key)}
            className={
              sortKey === s.key
                ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105"
                : "rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:text-accent"
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((q) => (
          <div
            key={q.id}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/companies/${q.company.id}`}
                className="font-semibold text-neutral-900 hover:text-accent hover:underline dark:text-neutral-100"
              >
                {q.company.name}
              </Link>
              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                {q.company.avgRating ? q.company.avgRating.toFixed(1) : "신규"}
                <span className="font-normal text-neutral-400">({q.company.reviewCount})</span>
              </span>
            </div>

            {q.company.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {q.company.services.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {s}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xl font-bold text-primary">{q.price.toLocaleString()}원</p>

            <div className="space-y-1 text-xs text-neutral-500">
              <p className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                수리 기간: {q.duration}
              </p>
              {q.availableDate && (
                <p className="flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  예약 가능일: {new Date(q.availableDate).toLocaleDateString("ko-KR")}
                </p>
              )}
              {q.onSiteAvailable && (
                <p className="flex items-center gap-1.5 text-primary">
                  <Truck className="h-3.5 w-3.5" />
                  출장 가능
                </p>
              )}
            </div>

            {q.message && (
              <p className="rounded-xl bg-surface-muted p-2.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {q.message}
              </p>
            )}

            <button
              type="button"
              onClick={() => handleReserve(q.id)}
              disabled={reservingId === q.id}
              className="mt-auto w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
            >
              {reservingId === q.id ? "예약 처리 중..." : "이 견적으로 예약하기"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
