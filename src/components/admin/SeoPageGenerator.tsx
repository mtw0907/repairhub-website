"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPE_LABEL: Record<string, string> = {
  REGION: "지역",
  BRAND: "브랜드",
  SYMPTOM: "증상/키워드",
};

export function SeoPageGenerator() {
  const router = useRouter();
  const [type, setType] = useState("REGION");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; introText: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch("/api/ai/admin/seo-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, keyword: keyword.trim() }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (res.ok) {
      setResult({ title: data.title, introText: data.introText });
      router.refresh();
    } else {
      setError(data?.error ?? "생성 중 오류가 발생했습니다.");
    }
  }

  return (
    <form
      onSubmit={handleGenerate}
      className="space-y-3 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        >
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          required
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="예: 서울특별시 마포구 / Fender / 기타 넥 변형"
          className="flex-1 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="whitespace-nowrap rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/20 disabled:opacity-50 dark:text-accent"
        >
          {loading ? "생성 중..." : "AI로 페이지 생성"}
        </button>
      </div>
      {error && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {error}
        </p>
      )}
      {result && (
        <div className="rounded-xl bg-surface-muted p-3 text-sm dark:bg-neutral-800">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{result.title}</p>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">{result.introText}</p>
        </div>
      )}
    </form>
  );
}
