"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finishSignIn(withOtp?: string) {
    const result = await signIn("credentials", {
      email,
      password,
      otp: withOtp,
      redirect: false,
    });

    if (!result || result.error) {
      setError(
        step === "otp"
          ? "인증번호가 올바르지 않거나 만료되었습니다."
          : "이메일 또는 비밀번호가 올바르지 않습니다.",
      );
      setLoading(false);
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as Role | undefined;
    router.push(role ? ROLE_DASHBOARD_PATH[role] : "/");
    router.refresh();
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(typeof data?.error === "string" ? data.error : "로그인 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    if (data.requiresOtp) {
      setLoading(false);
      setStep("otp");
      return;
    }

    await finishSignIn();
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await finishSignIn(otp);
  }

  if (step === "otp") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              이메일 인증
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {email}로 전송된 인증번호를 입력해주세요
            </p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                인증번호
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm tracking-widest dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              {loading ? "확인 중..." : "로그인"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setOtp("");
                setError(null);
              }}
              className="w-full text-center text-sm text-neutral-500 underline underline-offset-2"
            >
              뒤로가기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            RepairHub 로그인
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            음향기기 · 악기 수리 플랫폼
          </p>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              이메일
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                비밀번호
              </label>
              <Link href="/forgot-password" className="text-xs text-neutral-500 underline underline-offset-2">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <OAuthButtons />

        <p className="text-center text-sm text-neutral-500">
          계정이 없으신가요?{" "}
          <Link href="/register" className="font-medium text-neutral-900 underline dark:text-neutral-100">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
