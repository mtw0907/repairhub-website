"use client";

import { Music2 } from "lucide-react";
import { INSTRUMENT_CATEGORIES } from "@/lib/constants";

export function CategoryPills({
  active,
  onChange,
}: {
  active: string | null;
  onChange: (category: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={
          active === null
            ? "flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
            : "flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        }
      >
        전체
      </button>
      {INSTRUMENT_CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          type="button"
          onClick={() => onChange(active === cat.label ? null : cat.label)}
          className={
            active === cat.label
              ? "flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
              : "flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          }
        >
          <Music2 className="h-3.5 w-3.5" />
          {cat.label}
        </button>
      ))}
    </div>
  );
}
