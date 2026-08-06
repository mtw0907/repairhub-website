"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

type ProviderInfo = { id: string; name: string };

const PROVIDER_STYLE: Record<string, string> = {
  google: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
  kakao: "bg-[#FEE500] text-[#191919] hover:brightness-95",
  naver: "bg-[#03C75A] text-white hover:brightness-95",
};

export function OAuthButtons() {
  const [providers, setProviders] = useState<ProviderInfo[] | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data: Record<string, ProviderInfo>) => {
        setProviders(Object.values(data).filter((p) => p.id !== "credentials"));
      })
      .catch(() => setProviders([]));
  }, []);

  if (!providers || providers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        간편 로그인
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="space-y-2">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => signIn(provider.id, { redirectTo: "/" })}
            className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              PROVIDER_STYLE[provider.id] ?? "border border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {provider.name}로 계속하기
          </button>
        ))}
      </div>
    </div>
  );
}
