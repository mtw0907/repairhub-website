import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function PartnerAiAdCopyPage() {
  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          AI 광고 문구
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          업체의 강점을 입력하면 여러 톤의 광고 문구를 제안해드립니다.
        </p>
        <AiTextTool
          endpoint="/api/ai/ad-copy"
          fields={[
            {
              key: "points",
              label: "강점/포인트",
              type: "textarea",
              placeholder: "예: 당일 수리 가능, 15년 경력, 정품 부품만 사용",
            },
          ]}
          buttonLabel="광고 문구 생성"
        />
      </main>
    </div>
  );
}
