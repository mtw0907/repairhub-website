"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationRow, type NotificationItem } from "@/components/notifications/NotificationRow";

export function NotificationsList() {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async (reset: boolean, activeTab: "all" | "unread", afterCursor: string | null) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "20" });
    if (activeTab === "unread") params.set("unread", "true");
    if (afterCursor) params.set("cursor", afterCursor);

    const res = await fetch(`/api/notifications?${params}`);
    const data = await res.json();
    setNotifications((prev) => (reset ? data.notifications : [...prev, ...data.notifications]));
    setCursor(data.nextCursor);
    setUnreadCount(data.unreadCount);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(true, tab, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "PATCH" });
  }

  async function handleClickNotification(n: NotificationItem) {
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
    }
    if (n.link) router.push(n.link);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">알림</h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-neutral-500 hover:text-primary"
          >
            모두 읽음
          </button>
        )}
      </div>

      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={
            tab === "all"
              ? "rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
              : "rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
          }
        >
          전체
        </button>
        <button
          type="button"
          onClick={() => setTab("unread")}
          className={
            tab === "unread"
              ? "rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
              : "rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
          }
        >
          안읽음{unreadCount > 0 ? ` ${unreadCount}` : ""}
        </button>
      </div>

      <div className="space-y-1 rounded-2xl border border-neutral-200/70 bg-white p-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {notifications.map((n) => (
          <NotificationRow key={n.id} notification={n} onClick={handleClickNotification} />
        ))}
        {!loading && notifications.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-500">
            {tab === "unread" ? "안읽은 알림이 없습니다." : "알림이 없습니다."}
          </p>
        )}
      </div>

      {cursor && (
        <button
          type="button"
          onClick={() => load(false, tab, cursor)}
          disabled={loading}
          className="mt-4 w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
        >
          {loading ? "불러오는 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}
