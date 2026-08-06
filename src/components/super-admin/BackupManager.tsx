"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Backup = { filename: string; size: number; mtime: string };

export function BackupManager({ backups }: { backups: Backup[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmingRestore, setConfirmingRestore] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBackupNow() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/super-admin/backup", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      setMessage("백업이 생성되었습니다.");
      router.refresh();
    } else {
      setMessage("백업 생성 중 오류가 발생했습니다.");
    }
  }

  async function handleRestore(filename: string) {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/super-admin/backup/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    setLoading(false);
    setConfirmingRestore(null);
    if (res.ok) {
      setMessage("복원이 완료되었습니다.");
      router.refresh();
    } else {
      setMessage("복원 중 오류가 발생했습니다.");
    }
  }

  return (
    <div>
      <button
        onClick={handleBackupNow}
        disabled={loading}
        className="mb-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
      >
        지금 백업하기
      </button>
      {message && <p className="mb-3 text-sm text-neutral-500">{message}</p>}

      <ul className="space-y-2.5">
        {backups.map((b) => (
          <li
            key={b.filename}
            className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div>
              <p className="font-mono text-xs text-neutral-500">{b.filename}</p>
              <p className="text-xs text-neutral-400">
                {(b.size / 1024).toFixed(1)} KB · {new Date(b.mtime).toLocaleString("ko-KR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/api/super-admin/backup/${b.filename}`}
                className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                다운로드
              </a>
              {confirmingRestore === b.filename ? (
                <>
                  <button
                    onClick={() => handleRestore(b.filename)}
                    disabled={loading}
                    className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    복원 확정
                  </button>
                  <button
                    onClick={() => setConfirmingRestore(null)}
                    className="text-xs text-neutral-400"
                  >
                    취소
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmingRestore(b.filename)}
                  disabled={loading}
                  className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  이 시점으로 복원
                </button>
              )}
            </div>
          </li>
        ))}
        {backups.length === 0 && (
          <p className="rounded-2xl border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-500 dark:border-neutral-700">
            생성된 백업이 없습니다.
          </p>
        )}
      </ul>
    </div>
  );
}
