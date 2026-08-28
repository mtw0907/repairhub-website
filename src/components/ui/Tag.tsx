import type { ComponentPropsWithoutRef } from "react";

// 카테고리/서비스/브랜드 pill 태그 표준화. CompanyCard 등에 흩어져 있던
// 인라인 pill 스타일을 하나로 모은다.
export function Tag({
  active = false,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"span"> & { active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-surface-muted text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
      } ${className}`}
      {...props}
    />
  );
}
