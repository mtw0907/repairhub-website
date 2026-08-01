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
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={
          checked
            ? "rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            : "rounded-full border border-neutral-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-neutral-700"
        }
      >
        {checked ? "ON" : "OFF"}
      </button>
    </div>
  );
}
