"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewReplyForm({
  reviewId,
  reviewContent,
  rating,
  existingReply,
}: {
  reviewId: string;
  reviewContent: string;
  rating: number;
  existingReply: string | null;
}) {
  const router = useRouter();
  const [reply, setReply] = useState(existingReply ?? "");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setMessage(null);
    const res = await fetch("/api/ai/review-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewContent, rating }),
    });
    const data = await res.json().catch(() => null);
    setGenerating(false);
    if (res.ok) {
      setReply(data.result);
    } else {
      setMessage(data?.error ?? "AI 답글 생성 중 오류가 발생했습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/partner/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerReply: reply }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("답글이 저장되었습니다.");
      router.refresh();
    } else {
      setMessage("답글 저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        required
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        rows={2}
        placeholder="후기에 답글을 남겨주세요"
        className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "저장 중..." : existingReply ? "답글 수정" : "답글 등록"}
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/20 disabled:opacity-50 dark:text-accent"
        >
          {generating ? "생성 중..." : "AI 답글 생성"}
        </button>
        {message && <span className="text-xs text-neutral-500">{message}</span>}
      </div>
    </form>
  );
}
