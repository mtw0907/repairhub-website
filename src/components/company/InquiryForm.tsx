"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InquiryForm({ companyId, isUser }: { companyId: string; isUser: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isUser) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, message }),
    });
    setLoading(false);
    if (res.ok) {
      setStatus("문의가 접수되었습니다. 업체 답변을 기다려주세요.");
      setMessage("");
    } else {
      const data = await res.json().catch(() => null);
      setStatus(data?.error ?? "문의 등록 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="궁금하신 점을 남겨주세요"
        className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
      />
      {status && <p className="text-sm text-neutral-600 dark:text-neutral-400">{status}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "전송 중..." : "문의하기"}
      </button>
    </form>
  );
}
