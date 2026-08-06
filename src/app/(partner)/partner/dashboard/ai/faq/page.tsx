import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function PartnerAiFaqPage() {
  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          AI FAQ 생성
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          자주 받는 질문 주제를 입력하면 Q&amp;A 초안을 만들어드립니다. 생성된 내용은 복사해서
          홈페이지나 안내 자료에 활용하세요.
        </p>
        <AiTextTool
          endpoint="/api/ai/faq"
          fields={[
            {
              key: "topic",
              label: "주제",
              type: "textarea",
              placeholder: "예: 수리 기간, 택배 접수 방법, A/S 정책",
            },
          ]}
          buttonLabel="FAQ 생성"
        />
      </main>
    </div>
  );
}
