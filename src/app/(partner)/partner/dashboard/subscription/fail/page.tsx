"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function FailContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") ?? "결제가 취소되었거나 실패했습니다.";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">결제 실패</h1>
      <p className="text-sm text-amber-700 dark:text-amber-400">{message}</p>
      <Link
        href="/partner/dashboard/subscription"
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
      >
        구독 관리로 이동
      </Link>
    </div>
  );
}

export default function SubscriptionFailPage() {
  return (
    <Suspense fallback={<p className="p-20 text-center text-sm text-neutral-500">불러오는 중...</p>}>
      <FailContent />
    </Suspense>
  );
}
