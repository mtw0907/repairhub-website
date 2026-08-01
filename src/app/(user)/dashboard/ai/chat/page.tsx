import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AiChatWidget } from "@/components/ai/AiChatWidget";

export default function AiChatPage() {
  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          AI 상담
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          플랫폼 이용이나 수리 관련 궁금한 점을 편하게 물어보세요.
        </p>
        <AiChatWidget />
      </main>
    </div>
  );
}
