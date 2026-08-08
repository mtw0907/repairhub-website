"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";

export default function ConsentPage() {
  const { update } = useSession();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/users/agree-terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agreeTerms, agreePrivacy }),
    });

    if (!res.ok) {
      setError("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    // Calling update() with no argument is a silent no-op (a plain GET that
    // re-reads the existing session) in this next-auth version — it must be
    // passed a (possibly empty) object to actually POST and re-run jwt()
    // with trigger: "update", which is what refreshes termsAgreedAt in the
    // cookie the proxy gate reads.
    const updated = await update({});
    const role = updated?.user?.role as Role | undefined;
    // A full navigation (not router.push) so the proxy's role-gate check
    // always reads the just-refreshed cookie instead of a route the App
    // Router may have prefetched before termsAgreedAt was set.
    window.location.href = role ? ROLE_DASHBOARD_PATH[role] : "/";
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-muted px-6 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="text-center">
          <h1 className="text-xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            약관 동의가 필요합니다
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            소셜 로그인으로 가입하신 경우 아래 동의 절차가 한 번 더 필요합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 rounded-xl bg-surface-muted px-3 py-3 dark:bg-neutral-800">
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 accent-primary"
              />
              <span>
                <Link href="/terms" target="_blank" className="font-medium underline underline-offset-2">
                  이용약관
                </Link>
                에 동의합니다 (필수)
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                required
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 accent-primary"
              />
              <span>
                <Link href="/privacy" target="_blank" className="font-medium underline underline-offset-2">
                  개인정보 수집 및 이용
                </Link>
                에 동의합니다 (필수)
              </span>
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !agreeTerms || !agreePrivacy}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "처리 중..." : "동의하고 계속하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
