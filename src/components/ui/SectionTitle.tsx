import type { ReactNode } from "react";

// 홈/마이페이지 섹션 제목 표준화 (제목 + 부제 + 우측 액션 슬롯).
export function SectionTitle({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-5 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
