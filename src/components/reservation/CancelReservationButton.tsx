"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/reservations/${reservationId}`, { method: "PATCH" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError("예약 취소 중 오류가 발생했습니다.");
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-neutral-600 dark:text-neutral-400">정말 취소하시겠습니까?</span>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="rounded-md bg-red-600 px-2 py-1 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "취소 중..." : "예, 취소"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-md border border-neutral-300 px-2 py-1 text-neutral-600 hover:border-primary/30 hover:bg-primary/8 hover:text-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
        >
          아니오
        </button>
        {error && <span className="text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
    >
      예약 취소
    </button>
  );
}
