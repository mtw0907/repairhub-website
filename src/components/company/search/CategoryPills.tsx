"use client";

import { getCategoryIcon, type CategoryTreeNode } from "@/lib/categories";

// 검색창 바로 아래 빠른 필터 pill. 예전엔 악기 세부품목 8개만 있던 하드코딩
// 목록(INSTRUMENT_CATEGORIES)을 썼는데, 이제 9개 대분류 전체(악기/음향기기/
// DJ공연장비/사진장비/영상장비/드론/3D프린터/취미전자/아웃도어)를 실제
// Category DB 트리에서 가져와 보여준다. `active` 값은 카테고리 한글명
// 그대로라 CompanySearchView의 기존 키워드 매칭 로직(haystack에
// categoryNames 포함됨)과 그대로 호환된다.
export function CategoryPills({
  active,
  onChange,
  categoryTree,
}: {
  active: string | null;
  onChange: (category: string | null) => void;
  categoryTree: CategoryTreeNode[];
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
      {categoryTree.map((cat) => {
        const Icon = getCategoryIcon(cat.icon);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(active === cat.name ? null : cat.name)}
            className={
              active === cat.name
                ? "flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                : "flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
