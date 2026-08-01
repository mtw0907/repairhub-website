import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

export default async function EstimatesPage() {
  const session = await auth();
  const estimates = await prisma.estimate.findMany({
    where: { userId: session!.user.id },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          내 견적 요청
        </h1>
        <div className="space-y-3">
          {estimates.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/companies/${e.company.id}`} className="font-medium hover:underline">
                  {e.company.name}
                </Link>
                <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {e.status === "REQUESTED" ? "답변 대기" : e.status === "ANSWERED" ? "답변 완료" : "종료"}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                {e.request}
              </p>
              {e.answer && (
                <div className="mt-3 rounded-md bg-neutral-50 p-3 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <p className="mb-1 text-xs font-semibold">업체 답변</p>
                  {e.answer}
                </div>
              )}
            </div>
          ))}
          {estimates.length === 0 && (
            <p className="text-sm text-neutral-500">아직 견적 요청 내역이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
