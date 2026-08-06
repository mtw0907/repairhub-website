"use client";

import { useState } from "react";

export function OtpEmailField({
  email,
  onEmailChange,
  purpose,
  verified,
  onVerifiedChange,
}: {
  email: string;
  onEmailChange: (value: string) => void;
  purpose: "REGISTER_USER" | "REGISTER_PARTNER" | "RESET_PASSWORD";
  verified: boolean;
  onVerifiedChange: (verified: boolean) => void;
}) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (res.ok) {
      setSent(true);
      setMessage("인증번호를 이메일로 발송했습니다. (최대 10분 이내 유효)");
    } else {
      setMessage(typeof data?.error === "string" ? data.error : "인증번호 발송 중 오류가 발생했습니다.");
    }
  }

  async function handleVerify() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, purpose }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (res.ok) {
      onVerifiedChange(true);
      setMessage(null);
    } else {
      setMessage(typeof data?.error === "string" ? data.error : "인증 중 오류가 발생했습니다.");
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        이메일
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          disabled={verified}
          onChange={(e) => {
            onEmailChange(e.target.value);
            if (verified) onVerifiedChange(false);
            setSent(false);
          }}
          className="w-full min-w-0 flex-1 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || verified || !email}
          className="shrink-0 rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          {verified ? "인증완료" : sent ? "재전송" : "인증번호 받기"}
        </button>
      </div>

      {sent && !verified && (
        <div className="mt-2 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="인증번호 6자리"
            inputMode="numeric"
            maxLength={6}
            className="w-full min-w-0 flex-1 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            확인
          </button>
        </div>
      )}

      {verified && (
        <p className="mt-1.5 text-sm font-medium text-primary">✓ 이메일 인증 완료</p>
      )}
      {message && !verified && (
        <p className="mt-1.5 text-sm text-neutral-500">{message}</p>
      )}
    </div>
  );
}
