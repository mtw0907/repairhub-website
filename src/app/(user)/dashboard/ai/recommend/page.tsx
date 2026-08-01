import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function AiRecommendPage() {
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
          AI 업체추천
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          어떤 수리가 필요한지와 원하는 지역을 알려주시면, 등록된 업체 중에서 추천해드립니다.
        </p>
        <AiTextTool
          endpoint="/api/ai/recommend"
          fields={[
            {
              key: "need",
              label: "필요한 서비스",
              type: "textarea",
              placeholder: "예: 통기타 프렛 작업을 잘하는 업체를 찾고 있어요.",
            },
            {
              key: "region",
              label: "희망 지역 (선택)",
              type: "text",
              placeholder: "예: 서울특별시 마포구",
              optional: true,
            },
          ]}
          buttonLabel="추천 받기"
        />
      </main>
    </div>
  );
}
