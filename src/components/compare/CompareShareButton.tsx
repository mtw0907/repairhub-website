"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function CompareShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "업체 비교", url });
        return;
      } catch {
        // user canceled or share failed — fall back to clipboard copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-[#2563EB]" />
          링크 복사됨
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          비교 공유하기
        </>
      )}
    </button>
  );
}
