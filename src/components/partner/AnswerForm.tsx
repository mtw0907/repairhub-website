"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AnswerForm({
  endpoint,
  existingAnswer,
}: {
  endpoint: string;
  existingAnswer: string | null;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState(existingAnswer ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("답변이 저장되었습니다.");
      router.refresh();
    } else {
      setMessage("답변 저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        required
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        placeholder="답변을 입력하세요"
        className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "저장 중..." : existingAnswer ? "답변 수정" : "답변 등록"}
        </button>
        {message && <span className="text-xs text-neutral-500">{message}</span>}
      </div>
    </form>
  );
}
