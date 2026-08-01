"use client";

import { useState } from "react";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
  optional?: boolean;
};

export function AiTextTool({
  endpoint,
  fields,
  buttonLabel,
}: {
  endpoint: string;
  fields: FieldConfig[];
  buttonLabel: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, ""])),
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((f) =>
          f.type === "text" ? (
            <input
              key={f.key}
              required={!f.optional}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder ?? f.label}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          ) : (
            <textarea
              key={f.key}
              required={!f.optional}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder ?? f.label}
              rows={4}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          ),
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {loading ? "생성 중..." : buttonLabel}
        </button>
      </form>

      {error && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {error}
        </p>
      )}

      {result && (
        <div className="whitespace-pre-line rounded-lg border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
          {result}
        </div>
      )}
    </div>
  );
}
