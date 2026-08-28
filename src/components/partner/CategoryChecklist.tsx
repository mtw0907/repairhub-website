"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { getCategoryIcon, type CategoryTreeNode } from "@/lib/categories";

// 파트너 프로필 편집 화면의 "수리 가능 카테고리" 체크박스 트리. 대분류별로
// 세부 품목을 묶어 다중 선택하고, 전체 선택 상태를 한 번에 PUT으로 저장한다.
export function CategoryChecklist({
  tree,
  initialSelectedIds,
}: {
  tree: CategoryTreeNode[];
  initialSelectedIds: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelectedIds));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/partner/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryIds: [...selected] }),
    });
    setSaving(false);
    setMessage(res.ok ? "저장되었습니다." : "저장 중 오류가 발생했습니다.");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {tree.map((top) => {
          const Icon = getCategoryIcon(top.icon);
          return (
            <div
              key={top.id}
              className="rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="mb-2.5 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-neutral-200">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{top.name}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {top.children.map((sub) => {
                  const active = selected.has(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggle(sub.id)}
                      className={
                        active
                          ? "flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                          : "flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-accent/50 dark:border-neutral-700 dark:text-neutral-300"
                      }
                    >
                      {active && <Check className="h-3 w-3" />}
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? "저장 중..." : "카테고리 저장"}
        </button>
        {message && <p className="text-sm text-neutral-500">{message}</p>}
      </div>
    </div>
  );
}
