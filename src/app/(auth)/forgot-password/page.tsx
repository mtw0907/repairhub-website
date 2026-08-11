"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OtpEmailField } from "@/components/auth/OtpEmailField";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(
        typeof data?.error === "string" ? data.error : "비밀번호 재설정 중 오류가 발생했습니다.",
      );
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-muted px-6 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="text-center">
          <h1 className="text-xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            비밀번호 재설정
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            가입한 이메일로 인증번호를 받아 새 비밀번호를 설정하세요
          </p>
        </div>

        {done ? (
          <p className="text-center text-sm font-medium text-primary">
            ✓ 비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <OtpEmailField
              email={email}
              onEmailChange={setEmail}
              purpose="RESET_PASSWORD"
              verified={emailVerified}
              onVerifiedChange={setEmailVerified}
            />

            {emailVerified && (
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  새 비밀번호 (8자 이상)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !emailVerified}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-neutral-500">
          <Link
            href="/login"
            className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80 dark:hover:text-accent"
          >
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
