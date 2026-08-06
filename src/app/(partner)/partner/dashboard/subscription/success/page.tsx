"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    fetch("/api/payments/toss/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (res.ok) {
          setStatus("ok");
        } else {
          setStatus("error");
          setMessage(data?.error ?? "결제 승인 중 오류가 발생했습니다.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("결제 승인 요청 중 오류가 발생했습니다.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      {status === "loading" && <p className="text-sm text-neutral-500">결제를 확인하는 중입니다...</p>}
      {status === "ok" && (
        <>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Pro 구독이 시작되었습니다
          </h1>
          <p className="text-sm text-neutral-500">이제 프리미엄 혜택을 이용하실 수 있습니다.</p>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            결제 승인 실패
          </h1>
          <p className="text-sm text-amber-700 dark:text-amber-400">{message}</p>
        </>
      )}
      <Link
        href="/partner/dashboard/subscription"
        className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90"
      >
        구독 관리로 이동
      </Link>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<p className="p-20 text-center text-sm text-neutral-500">불러오는 중...</p>}>
      <SuccessContent />
    </Suspense>
  );
}
