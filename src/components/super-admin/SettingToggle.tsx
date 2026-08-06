"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingToggle({
  settingKey,
  label,
  description,
  initialValue,
}: {
  settingKey: string;
  label: string;
  description: string;
  initialValue: boolean;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const next = !checked;
    setLoading(true);
    const res = await fetch("/api/super-admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: settingKey, value: String(next) }),
    });
    setLoading(false);
    if (res.ok) {
      setChecked(next);
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={
          checked
            ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            : "rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-500 disabled:opacity-50 dark:border-neutral-700"
        }
      >
        {checked ? "ON" : "OFF"}
      </button>
    </div>
  );
}
