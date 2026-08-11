"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/companies?keyword=${encodeURIComponent(value.trim())}`);
    setOpen(false);
    setValue("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="검색"
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent dark:text-neutral-400 dark:hover:border-accent/40 dark:hover:bg-accent/15 dark:hover:text-accent"
      >
        <Search className="h-4.5 w-4.5" />
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <button type="submit" aria-label="검색" className="shrink-0 text-neutral-400 hover:text-accent">
        <Search className="h-4 w-4" />
      </button>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => !value && setOpen(false)}
        placeholder="업체·브랜드 검색"
        className="w-32 border-0 bg-transparent text-sm outline-none placeholder:text-neutral-400 sm:w-44"
      />
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setValue("");
        }}
        className="text-neutral-400 hover:text-neutral-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
