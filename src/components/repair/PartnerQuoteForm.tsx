"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ExistingQuote = {
  price: number;
  duration: string;
  availableDate: string | null;
  onSiteAvailable: boolean;
  message: string | null;
};

export function PartnerQuoteForm({
  repairRequestId,
  existingQuote,
}: {
  repairRequestId: string;
  existingQuote?: ExistingQuote;
}) {
  const router = useRouter();
  const [price, setPrice] = useState(existingQuote ? String(existingQuote.price) : "");
  const [duration, setDuration] = useState(existingQuote?.duration ?? "");
  const [availableDate, setAvailableDate] = useState(
    existingQuote?.availableDate ? existingQuote.availableDate.slice(0, 10) : "",
  );
  const [onSiteAvailable, setOnSiteAvailable] = useState(existingQuote?.onSiteAvailable ?? false);
  const [message, setMessage] = useState(existingQuote?.message ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    const res = await fetch(`/api/repair-requests/${repairRequestId}/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(price),
        duration,
        availableDate: availableDate || null,
        onSiteAvailable,
        message,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setStatus(existingQuote ? "견적이 수정되었습니다." : "견적을 제출했습니다.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setStatus(data?.error ?? "견적 제출 중 오류가 발생했습니다.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
    >
      <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
        {existingQuote ? "내 견적 수정" : "견적 제출하기"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            예상 가격 (원)
          </label>
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            수리 기간
          </label>
          <input
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="예: 2~3일"
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            방문/수리 가능 날짜 (선택)
          </label>
          <input
            type="date"
            value={availableDate}
            onChange={(e) => setAvailableDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={onSiteAvailable}
            onChange={(e) => setOnSiteAvailable(e.target.checked)}
          />
          출장 가능
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          메시지 (선택)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="고객에게 전달할 메시지를 입력하세요"
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      {status && <p className="text-sm text-neutral-600 dark:text-neutral-400">{status}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
      >
        {submitting ? "저장 중..." : existingQuote ? "견적 수정하기" : "견적 제출하기"}
      </button>
    </form>
  );
}
