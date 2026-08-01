"use client";

import { useState } from "react";

export function AiInlineAction({
  endpoint,
  body,
  buttonLabel,
}: {
  endpoint: string;
  body: Record<string, unknown>;
  buttonLabel: string;
}) {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (res.ok) {
      setResult(data.result);
    } else {
      setError(data?.error ?? "요청 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        {loading ? "분석 중..." : buttonLabel}
      </button>
      {error && (
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{error}</p>
      )}
      {result && (
        <div className="mt-2 whitespace-pre-line rounded-md bg-neutral-50 p-3 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          {result}
        </div>
      )}
    </div>
  );
}
