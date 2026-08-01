import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AiChatWidget } from "@/components/ai/AiChatWidget";

export default function PartnerAiCustomerChatPage() {
  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/partner/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          AI 고객 상담
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          고객 응대 문구 작성이나 운영 관련 궁금한 점을 물어보세요.
        </p>
        <AiChatWidget mode="partner" />
      </main>
    </div>
  );
}
