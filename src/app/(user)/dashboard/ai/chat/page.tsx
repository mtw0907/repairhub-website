import { UserPageHeader } from "@/components/UserPageHeader";
import { AiChatWidget } from "@/components/ai/AiChatWidget";

export default function AiChatPage() {
  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
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
