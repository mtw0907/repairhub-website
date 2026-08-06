"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiInlineAction } from "@/components/ai/AiInlineAction";

export function AdminReviewRow({
  review,
}: {
  review: {
    id: string;
    userName: string;
    companyName: string;
    rating: number;
    content: string;
    status: string;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {review.companyName} · {review.userName}
        </span>
        <span
          className={
            review.status === "VISIBLE"
              ? "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800"
          }
        >
          {review.status}
        </span>
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
        <span className="text-accent">{"★".repeat(review.rating)}</span> {review.content}
      </p>
      {review.status !== "DELETED" && (
        <div className="mt-3 flex gap-2">
          {review.status === "VISIBLE" ? (
            <button
              onClick={() => updateStatus("HIDDEN")}
              disabled={loading}
              className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              숨기기
            </button>
          ) : (
            <button
              onClick={() => updateStatus("VISIBLE")}
              disabled={loading}
              className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              공개
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            삭제
          </button>
        </div>
      )}

      <AiInlineAction
        endpoint="/api/ai/admin/audit-review"
        body={{ reviewId: review.id }}
        buttonLabel="AI 검수 (스팸/부적절 여부)"
      />
    </div>
  );
}
