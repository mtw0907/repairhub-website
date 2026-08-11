import {
  BadgeCheck,
  CalendarClock,
  CalendarPlus,
  CreditCard,
  Database,
  Flag,
  MessageCircle,
  MessageSquare,
  Receipt,
  ShieldAlert,
  Sparkles,
  Star,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string | Date;
};

const TYPE_ICON: Record<string, LucideIcon> = {
  RESERVATION_STATUS: CalendarClock,
  NEW_QUOTE: Receipt,
  REVIEW_REPLY: MessageSquare,
  INQUIRY_ANSWERED: MessageCircle,
  NEW_RESERVATION: CalendarPlus,
  RESERVATION_CHANGED: CalendarClock,
  NEW_REVIEW: Star,
  NEW_INQUIRY: MessageCircle,
  REPAIR_REQUEST_MATCHED: Sparkles,
  COMPANY_APPROVED: BadgeCheck,
  PARTNER_SIGNUP: UserPlus,
  REPORT_FILED: Flag,
  ADMIN_ACCOUNT_CHANGED: ShieldAlert,
  DB_BACKUP_EVENT: Database,
  SUBSCRIPTION_RENEWAL_FAILED: CreditCard,
};

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export function NotificationRow({
  notification,
  onClick,
}: {
  notification: NotificationItem;
  onClick: (notification: NotificationItem) => void;
}) {
  const Icon = TYPE_ICON[notification.type] ?? Sparkles;

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-accent/10 dark:hover:bg-accent/15 ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
          <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {notification.title}
          </span>
        </span>
        {notification.body && (
          <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">
            {notification.body}
          </span>
        )}
        <span className="mt-0.5 block text-[11px] text-neutral-400">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>
    </button>
  );
}
