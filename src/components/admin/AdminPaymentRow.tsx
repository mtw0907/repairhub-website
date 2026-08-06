"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminPaymentRow({
  payment,
}: {
  payment: {
    id: string;
    userName: string;
    companyName: string | null;
    amount: number;
    status: string;
    orderName: string | null;
    createdAt: string;
  };
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefund() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/payments/${payment.id}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "관리자 환불 처리" }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "환불 처리 중 오류가 발생했습니다.");
      setConfirming(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {payment.companyName ?? "-"} · {payment.userName}
        </span>
        <span
          className={
            payment.status === "PAID"
              ? "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800"
          }
        >
          {payment.status}
        </span>
      </div>
      <p className="mt-1.5 text-neutral-600 dark:text-neutral-400">
        {payment.orderName ?? "결제"} · <span className="font-semibold text-neutral-800 dark:text-neutral-200">{payment.amount.toLocaleString()}원</span> ·{" "}
        {new Date(payment.createdAt).toLocaleDateString("ko-KR")}
      </p>

      {payment.status === "PAID" && (
        <div className="mt-3">
          {confirming ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">환불을 진행하시겠습니까?</span>
              <button
                onClick={handleRefund}
                disabled={loading}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "처리 중..." : "환불 확정"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="rounded-lg border border-neutral-300 px-2.5 py-1.5 dark:border-neutral-700"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              환불 처리
            </button>
          )}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
