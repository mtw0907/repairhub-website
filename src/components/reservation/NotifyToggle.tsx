"use client";

import { useState } from "react";

export function NotifyToggle({
  reservationId,
  initialEnabled,
}: {
  reservationId: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !enabled;
    setLoading(true);
    setEnabled(next);
    const res = await fetch(`/api/reservations/${reservationId}/notify-preference`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyEnabled: next }),
    });
    setLoading(false);
    if (!res.ok) setEnabled(!next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={enabled}
      className={
        enabled
          ? "relative h-7 w-12 shrink-0 rounded-full bg-primary transition-colors disabled:opacity-50"
          : "relative h-7 w-12 shrink-0 rounded-full bg-neutral-300 transition-colors disabled:opacity-50 dark:bg-neutral-700"
      }
    >
      <span
        className={
          enabled
            ? "absolute top-0.5 left-6 h-6 w-6 rounded-full bg-white shadow transition-transform"
            : "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
        }
      />
    </button>
  );
}
