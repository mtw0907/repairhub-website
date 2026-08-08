"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "활성",
  SUSPENDED: "정지됨",
  DELETED: "삭제됨",
};

export function AdminUserRow({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
          {user.name} <span className="text-xs font-normal text-neutral-400">({user.role})</span>
        </p>
        <p className="text-xs text-neutral-500">
          {user.email} {user.phone ? `· ${user.phone}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={
            user.status === "ACTIVE"
              ? "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800"
          }
        >
          {STATUS_LABEL[user.status] ?? user.status}
        </span>
        {user.status !== "DELETED" && (
          <>
            {user.status === "ACTIVE" ? (
              <button
                onClick={() => updateStatus("SUSPENDED")}
                disabled={loading}
                className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary disabled:opacity-50 dark:border-neutral-700 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
              >
                정지
              </button>
            ) : (
              <button
                onClick={() => updateStatus("ACTIVE")}
                disabled={loading}
                className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                활성화
              </button>
            )}
            {confirmingDelete ? (
              <>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  확인
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  disabled={loading}
                  className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs hover:border-primary/30 hover:bg-primary/8 hover:text-primary dark:border-neutral-700 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmingDelete(true)}
                disabled={loading}
                className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                삭제
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
