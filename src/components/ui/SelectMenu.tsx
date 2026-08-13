"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectMenuOption = { value: string; label: string };

/** 사이트 디자인에 맞춘 커스텀 드롭다운. 네이티브 select는 열린 목록의
 * 폰트/색을 CSS로 제어할 수 없어서, 닫힌 상태와 열린 목록 모두 직접 그린다. */
export function SelectMenu({
  value,
  placeholder,
  options,
  onChange,
  disabled,
  compact,
}: {
  value: string;
  placeholder: string;
  options: SelectMenuOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** 검색 필터 바 같은 좁은 공간용 작은 스타일. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-surface-muted outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-800 ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2.5 text-sm"
        } ${
          open
            ? "border-primary/40 ring-2 ring-primary/10"
            : "border-neutral-200 hover:border-accent/50 dark:border-neutral-700"
        }`}
      >
        <span
          className={
            selected
              ? "truncate text-neutral-900 dark:text-neutral-100"
              : "truncate text-neutral-400"
          }
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`shrink-0 text-neutral-400 transition-transform ${compact ? "h-3.5 w-3.5" : "h-4 w-4"} ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 ${compact ? "w-40" : "w-full"}`}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={
                o.value === value
                  ? "flex w-full items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-left text-sm font-semibold text-primary"
                  : "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-accent/10 hover:text-accent dark:text-neutral-300"
              }
            >
              {o.label}
              {o.value === value && <Check className="h-3.5 w-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
