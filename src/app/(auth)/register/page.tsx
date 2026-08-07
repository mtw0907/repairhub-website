"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { OtpEmailField } from "@/components/auth/OtpEmailField";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, agreeTerms, agreePrivacy }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(
        typeof data?.error === "string"
          ? data.error
          : "회원가입 중 오류가 발생했습니다.",
      );
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface-muted px-6 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="text-center">
          <h1 className="text-xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            RepairHub 회원가입
          </h1>
          <p className="mt-1 text-sm text-neutral-500">일반 사용자 계정을 만듭니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              이름
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <OtpEmailField
            email={email}
            onEmailChange={setEmail}
            purpose="REGISTER_USER"
            verified={emailVerified}
            onVerifiedChange={setEmailVerified}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              전화번호 (선택)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              비밀번호 (8자 이상)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

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
            disabled={loading || !emailVerified || !agreeTerms || !agreePrivacy}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <OAuthButtons />

        <div className="space-y-2 text-center text-sm text-neutral-500">
          <p>
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-medium text-primary underline underline-offset-2">
              로그인
            </Link>
          </p>
          <p>
            업체(수리점) 사장님이신가요?{" "}
            <Link href="/register/partner" className="font-medium text-primary underline underline-offset-2">
              업체로 가입하기 →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
