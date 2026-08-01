"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isSelf: boolean;
};

export function AdminAccountRow({ admin }: { admin: AdminAccount }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/super-admin/admins/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "변경 중 오류가 발생했습니다.");
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/super-admin/admins/${admin.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {admin.name} {admin.isSelf && <span className="text-xs text-neutral-400">(나)</span>}
          </p>
          <p className="text-xs text-neutral-500">{admin.email}</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {admin.status}
        </span>
      </div>

      {!admin.isSelf && admin.status !== "DELETED" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={admin.role}
            onChange={(e) => patch({ role: e.target.value })}
            disabled={loading}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
          {admin.status === "ACTIVE" ? (
            <button
              onClick={() => patch({ status: "SUSPENDED" })}
              disabled={loading}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              정지
            </button>
          ) : (
            <button
              onClick={() => patch({ status: "ACTIVE" })}
              disabled={loading}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              활성화
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            삭제
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
