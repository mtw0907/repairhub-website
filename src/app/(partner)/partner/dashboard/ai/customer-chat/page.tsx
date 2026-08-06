import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AiChatWidget } from "@/components/ai/AiChatWidget";

export default function PartnerAiCustomerChatPage() {
  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
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
