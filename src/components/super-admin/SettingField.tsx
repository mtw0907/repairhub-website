"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingField({
  settingKey,
  label,
  sensitive,
  initialValue,
  hasValue,
}: {
  settingKey: string;
  label: string;
  sensitive: boolean;
  initialValue: string | null;
  hasValue?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(sensitive ? "" : (initialValue ?? ""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    if (sensitive && !value) return;
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/super-admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: settingKey, value }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("저장되었습니다.");
      if (sensitive) setValue("");
      router.refresh();
    } else {
      setMessage("저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        {sensitive && (
          <span className="ml-2 text-xs font-normal text-neutral-400">
            {hasValue ? "설정됨 — 변경하려면 새 값 입력" : "미설정"}
          </span>
        )}
      </label>
      <div className="flex gap-2">
        <input
          type={sensitive ? "password" : "text"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={sensitive ? "••••••••" : ""}
          className="flex-1 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button
          onClick={handleSave}
          disabled={loading || (sensitive && !value)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          저장
        </button>
      </div>
      {message && <p className="mt-1 text-xs text-neutral-500">{message}</p>}
    </div>
  );
}
