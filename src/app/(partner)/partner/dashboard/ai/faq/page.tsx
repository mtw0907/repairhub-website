import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function PartnerAiFaqPage() {
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
