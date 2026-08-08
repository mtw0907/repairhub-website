"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CustomSettingsManager({
  settings,
}: {
  settings: { key: string; value: string }[];
}) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    await fetch("/api/super-admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim(), value }),
    });
    setLoading(false);
    setKey("");
    setValue("");
    router.refresh();
  }

  async function handleDelete(k: string) {
    setLoading(true);
    await fetch(`/api/super-admin/settings/${encodeURIComponent(k)}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <ul className="mb-3 space-y-2">
        {settings.map((s) => (
          <li
            key={s.key}
            className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-white px-4 py-2.5 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span>
              <span className="font-mono text-xs text-neutral-500">{s.key}</span> = {s.value}
            </span>
            <button
              onClick={() => handleDelete(s.key)}
              disabled={loading}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              삭제
            </button>
          </li>
        ))}
        {settings.length === 0 && (
          <p className="text-sm text-neutral-500">등록된 사용자 정의 환경변수가 없습니다.</p>
        )}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="KEY"
          className="w-1/3 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="value"
          className="flex-1 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary disabled:opacity-50 dark:border-neutral-700 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
        >
          추가
        </button>
      </form>
    </div>
  );
}
