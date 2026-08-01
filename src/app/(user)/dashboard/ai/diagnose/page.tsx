import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { AiTextTool } from "@/components/ai/AiTextTool";

export default function AiDiagnosePage() {
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
          AI 고장진단
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          증상을 자세히 설명하면 가능한 원인과 간단한 점검 방법을 안내해드립니다.
        </p>
        <AiTextTool
          endpoint="/api/ai/diagnose"
          fields={[
            {
              key: "symptom",
              label: "증상",
              type: "textarea",
              placeholder: "예: 앰프에서 전원을 켜면 지지직거리는 소음이 계속 납니다.",
            },
          ]}
          buttonLabel="진단 받기"
        />
      </main>
    </div>
  );
}
