import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function PartnerAiBlogPage() {
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
