"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export type SelectMenuOption = { value: string; label: string };

/** 사이트 디자인에 맞춘 커스텀 드롭다운. 네이티브 select는 열린 목록의
 * 폰트/색을 CSS로 제어할 수 없어서, 닫힌 상태와 열린 목록 모두 직접 그린다.
 * 열린 목록은 document.body에 포털로 렌더링해, 조상 요소에 overflow-hidden이
 * 걸려 있어도(지도/카드 패널 등) 잘리지 않고 항상 트리거 바로 아래에 뜬다. */
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
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onScrollOrResize() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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

      {open &&
        mounted &&
        createPortal(
          <div
            ref={listRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: compact ? 160 : Math.max(pos.width, 160),
            }}
            className="z-50 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
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
          </div>,
          document.body,
        )}
    </div>
  );
}
