"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PRO_PLAN_PRICE } from "@/lib/constants";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        options: {
          amount: number;
          orderId: string;
          orderName: string;
          customerName?: string;
          successUrl: string;
          failUrl: string;
        },
      ) => Promise<void>;
    };
  }
}

function loadTossScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.TossPayments) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("결제 SDK 로드에 실패했습니다."));
    document.head.appendChild(script);
  });
}

export default function SubscriptionCheckoutPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/subscriptions/checkout", { method: "POST" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setLoading(false);
      setError(data?.error ?? "결제 준비 중 오류가 발생했습니다.");
      return;
    }

    try {
      await loadTossScript();
      const tossPayments = window.TossPayments!(data.clientKey);
      const origin = window.location.origin;
      await tossPayments.requestPayment("카드", {
        amount: data.amount,
        orderId: data.orderId,
        orderName: data.orderName,
        customerName: session?.user?.name ?? undefined,
        successUrl: `${origin}/partner/dashboard/subscription/success`,
        failUrl: `${origin}/partner/dashboard/subscription/fail`,
      });
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "결제 요청 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/partner/dashboard/subscription" className="text-sm text-neutral-500 hover:underline">
          ← 구독 관리로
        </Link>
      </header>
      <main className="mx-auto max-w-md px-6 py-12 text-center">
        <h1 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          RepairHub Pro 구독
        </h1>
        <p className="mb-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          월 {PRO_PLAN_PRICE.toLocaleString()}원
        </p>
        <p className="mb-8 text-sm text-neutral-500">
          프리미엄 노출, 추천 업체 우선 배치 등 Pro 혜택을 이용하세요.
        </p>

        {error && (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            {error}
          </p>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {loading ? "결제 준비 중..." : "토스페이먼츠로 결제하기"}
        </button>
        <p className="mt-4 text-xs text-neutral-400">
          결제 페이지는 토스페이먼츠에서 안전하게 처리되며, 카드 정보는 RepairHub 서버에
          저장되지 않습니다.
        </p>
      </main>
    </div>
  );
}
