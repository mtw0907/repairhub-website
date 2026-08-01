import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function AiEstimatePage() {
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
          AI 예상 수리비
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          수리 내용을 설명하면 대략적인 비용 범위를 안내해드립니다. 실제 비용은 업체 견적과 다를
          수 있습니다.
        </p>
        <AiTextTool
          endpoint="/api/ai/estimate-cost"
          fields={[
            {
              key: "description",
              label: "수리 내용",
              type: "textarea",
              placeholder: "예: 일렉기타 픽업 하나를 교체하고 싶습니다.",
            },
          ]}
          buttonLabel="예상 비용 확인"
        />
      </main>
    </div>
  );
}
