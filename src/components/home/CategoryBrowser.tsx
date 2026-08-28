"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getCategoryIcon, type CategoryTreeNode } from "@/lib/categories";

export function CategoryBrowser({ tree }: { tree: CategoryTreeNode[] }) {
  const [openId, setOpenId] = useState<string | null>(tree[0]?.id ?? null);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tree.map((top) => {
        const Icon = getCategoryIcon(top.icon);
        const open = openId === top.id;
        return (
          <div
            key={top.id}
            className={
              open
                ? "overflow-hidden rounded-2xl border border-primary bg-white shadow-sm dark:border-primary dark:bg-neutral-900"
                : "overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition-colors hover:border-accent/50 dark:border-neutral-800 dark:bg-neutral-900"
            }
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : top.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span
                className={
                  open
                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-neutral-200"
                }
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {top.name}
                </span>
                <span className="block text-xs text-neutral-500">세부 품목 {top.children.length}개</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180 text-accent" : ""}`}
              />
            </button>

            {open && (
              <div className="flex flex-wrap gap-2 border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
                {top.children.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/companies?category=${sub.slug}`}
                    className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
