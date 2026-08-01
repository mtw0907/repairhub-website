import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function PartnerAiAdCopyPage() {
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
