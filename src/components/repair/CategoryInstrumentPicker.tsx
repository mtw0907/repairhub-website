"use client";

import { getCategoryIcon, type CategoryNode, type CategoryTreeNode } from "@/lib/categories";

export type CategorySelection = {
  categoryId: string | null; // 대분류 Category.id
  categoryName: string | null; // 대분류 이름 (한글) — 제출 시 RepairRequest.category/Reservation.instrumentCategory에 그대로 사용
  subcategoryId: string | null; // 세부 품목 Category.id (직접 입력 시 null)
  instrument: string; // 세부 품목 이름 또는 직접 입력한 문자열
  isCustom: boolean;
};

export const EMPTY_CATEGORY_SELECTION: CategorySelection = {
  categoryId: null,
  categoryName: null,
  subcategoryId: null,
  instrument: "",
  isCustom: false,
};

// AI 견적 매칭(NewRepairRequestForm)과 예약 폼(ReservationForm)이 공용으로
// 쓰는 대분류→세부품목 선택기. 대분류는 Category DB 트리를 그대로 그리고,
// 세부품목은 목록 칩 + "직접 입력" 자유 텍스트를 함께 제공한다.
export function CategoryInstrumentPicker({
  tree,
  value,
  onChange,
  mode = "both",
}: {
  tree: CategoryTreeNode[];
  value: CategorySelection;
  onChange: (next: CategorySelection) => void;
  /** AI 견적 위저드처럼 대분류/세부품목을 서로 다른 스텝 화면으로 나눠
   * 보여줘야 할 때 "category"/"subcategory"로 한쪽만 렌더링한다. 기본값
   * "both"는 기존처럼(예약 폼 등) 한 화면에 이어서 보여준다. */
  mode?: "both" | "category" | "subcategory";
}) {
  const selectedTop = tree.find((t) => t.id === value.categoryId) ?? null;
  const showCategory = mode === "both" || mode === "category";
  const showSubcategory = mode === "both" || mode === "subcategory";

  function selectTop(top: CategoryTreeNode) {
    onChange({ categoryId: top.id, categoryName: top.name, subcategoryId: null, instrument: "", isCustom: false });
  }

  function selectSub(sub: CategoryNode) {
    onChange({ ...value, subcategoryId: sub.id, instrument: sub.name, isCustom: false });
  }

  function selectCustom() {
    onChange({ ...value, subcategoryId: null, instrument: "", isCustom: true });
  }

  return (
    <div className="space-y-5">
      {showCategory && (
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            어떤 장비인가요?
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {tree.map((top) => {
              const Icon = getCategoryIcon(top.icon);
              const active = value.categoryId === top.id;
              return (
                <button
                  key={top.id}
                  type="button"
                  onClick={() => selectTop(top)}
                  className={
                    active
                      ? "flex flex-col items-center gap-1.5 rounded-xl border border-primary bg-primary/10 p-3 text-center transition-colors"
                      : "flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 p-3 text-center transition-colors hover:border-accent/50 dark:border-neutral-700"
                  }
                >
                  <Icon className={active ? "h-5 w-5 text-primary" : "h-5 w-5 text-neutral-500 dark:text-neutral-400"} />
                  <span className="text-xs font-semibold leading-tight text-neutral-900 dark:text-neutral-100">
                    {top.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showSubcategory && selectedTop && (
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            세부 종류
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedTop.children.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => selectSub(sub)}
                className={
                  !value.isCustom && value.subcategoryId === sub.id
                    ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                    : "rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-600 transition-colors hover:border-accent/50 dark:border-neutral-700 dark:text-neutral-300"
                }
              >
                {sub.name}
              </button>
            ))}
            <button
              type="button"
              onClick={selectCustom}
              className={
                value.isCustom
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                  : "rounded-full border border-dashed border-neutral-300 px-4 py-1.5 text-sm text-neutral-500 transition-colors hover:border-accent/50 dark:border-neutral-700 dark:text-neutral-400"
              }
            >
              직접 입력
            </button>
          </div>
          {value.isCustom && (
            <input
              autoFocus
              value={value.instrument}
              onChange={(e) => onChange({ ...value, instrument: e.target.value })}
              placeholder="목록에 없는 종류를 직접 입력해주세요"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          )}
        </div>
      )}
    </div>
  );
}
