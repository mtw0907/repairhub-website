"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EstimateForm({ companyId, isUser }: { companyId: string; isUser: boolean }) {
  const router = useRouter();
  const [requestText, setRequestText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isUser) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, request: requestText }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("견적 요청을 보냈습니다. 업체 답변을 기다려주세요.");
      setRequestText("");
    } else {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "견적 요청 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          수리 내용 / 증상
        </label>
        <textarea
          required
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          rows={3}
          placeholder="예: 통기타 넥이 휘어서 프렛 버징이 있습니다. 예상 비용이 궁금합니다."
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      {message && <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "요청 중..." : "견적 요청하기"}
      </button>
    </form>
  );
}
