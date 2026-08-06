"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function ProfileForm({
  initialName,
  initialPhone,
  hasPassword,
}: {
  initialName: string;
  initialPhone: string;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  async function handleWithdraw() {
    setWithdrawError(null);
    setWithdrawLoading(true);

    const res = await fetch("/api/users/me", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: withdrawPassword }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setWithdrawError(
        typeof data?.error === "string" ? data.error : "회원 탈퇴 중 오류가 발생했습니다.",
      );
      setWithdrawLoading(false);
      return;
    }

    await signOut({ redirectTo: "/" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const body: Record<string, string> = { name, phone };
    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (res.ok) {
      setMessage("회원정보가 수정되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setMessage(
        typeof data?.error === "string" ? data.error : "회원정보 수정 중 오류가 발생했습니다.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          이름
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          전화번호
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          비밀번호 변경 (선택)
        </p>
        <div className="space-y-2">
          <input
            type="password"
            placeholder="현재 비밀번호"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            type="password"
            placeholder="새 비밀번호 (8자 이상)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      </div>

      {message && <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "저장 중..." : "저장"}
      </button>

      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        {!withdrawing ? (
          <button
            type="button"
            onClick={() => setWithdrawing(true)}
            className="text-sm text-red-600 underline underline-offset-2"
          >
            회원 탈퇴
          </button>
        ) : (
          <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              정말 탈퇴하시겠어요? 로그인 정보는 삭제되며 되돌릴 수 없습니다.
              (예약·리뷰 등 기존 내역은 운영 목적상 남아있을 수 있습니다.)
            </p>
            {hasPassword && (
              <input
                type="password"
                required
                placeholder="현재 비밀번호"
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-neutral-700 dark:bg-neutral-900"
              />
            )}
            {withdrawError && <p className="text-sm text-red-600">{withdrawError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawLoading || (hasPassword && !withdrawPassword)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {withdrawLoading ? "처리 중..." : "탈퇴 확정"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWithdrawing(false);
                  setWithdrawPassword("");
                  setWithdrawError(null);
                }}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
