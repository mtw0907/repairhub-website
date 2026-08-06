import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function PartnerAiBlogPage() {
  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          AI 블로그 작성
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          주제나 키워드를 입력하면 블로그 글 초안을 작성해드립니다.
        </p>
        <AiTextTool
          endpoint="/api/ai/blog"
          fields={[
            {
              key: "topic",
              label: "주제",
              type: "textarea",
              placeholder: "예: 겨울철 기타 습도 관리와 넥 변형 예방법",
            },
          ]}
          buttonLabel="블로그 글 생성"
        />
      </main>
    </div>
  );
}
