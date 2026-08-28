import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// 각 페이지에 흩어져 있던 "dashed border + 안내 문구" 빈 상태 패턴 표준화.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-neutral-700 ${className}`}
    >
      {Icon && <Icon className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />}
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      {description && <p className="text-xs text-neutral-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
