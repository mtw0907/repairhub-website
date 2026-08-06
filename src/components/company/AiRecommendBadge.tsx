"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export function AiRecommendBadge({ reasons }: { reasons: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[11px] font-semibold text-accent-foreground shadow-sm"
      >
        <Sparkles className="h-3 w-3" />
        AI 추천
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full z-20 mt-1.5 w-48 rounded-xl border border-neutral-200 bg-white p-2.5 text-[11px] text-neutral-600 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <p className="mb-1.5 font-semibold text-neutral-800 dark:text-neutral-100">
            AI가 추천하는 이유
          </p>
          <ul className="space-y-1">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
