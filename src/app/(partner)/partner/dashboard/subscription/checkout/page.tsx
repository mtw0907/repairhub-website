"use client";

import { useState } from "react";
import Link from "next/link";
import { PRO_PLAN_PRICE } from "@/lib/constants";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestBillingAuth: (
        method: string,
        options: {
          customerKey: string;
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
      await tossPayments.requestBillingAuth("카드", {
        customerKey: data.customerKey,
        successUrl: `${origin}/partner/dashboard/subscription/success`,
        failUrl: `${origin}/partner/dashboard/subscription/fail`,
      });
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "결제 요청 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="min-h-full bg-surface-muted">
      <header className="sticky top-0 z-30 flex items-center border-b border-neutral-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90 sm:px-6">
        <Link
          href="/partner/dashboard/subscription"
          className="text-sm font-medium text-neutral-500 transition-colors hover:text-accent dark:text-neutral-400"
        >
          ← 구독 관리로
        </Link>
      </header>
      <main className="mx-auto max-w-md px-4 py-12 text-center sm:px-6">
        <h1 className="mb-2 text-xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          소리수리 Pro 구독
        </h1>
        <p className="mb-1 text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
          월 {PRO_PLAN_PRICE.toLocaleString()}원
        </p>
        <p className="mb-8 text-sm text-neutral-500">
          프리미엄 노출, 추천 업체 우선 배치 등 Pro 혜택을 이용하세요. 매달 자동으로
          결제되며 언제든 해지할 수 있습니다.
        </p>

        {error && (
          <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            {error}
          </p>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "결제 준비 중..." : "카드 등록하고 정기결제 시작"}
        </button>
        <p className="mt-4 text-xs text-neutral-400">
          카드 등록은 토스페이먼츠에서 안전하게 처리되며, 카드 정보는 소리수리 서버에
          저장되지 않습니다.
        </p>
      </main>
    </div>
  );
}
