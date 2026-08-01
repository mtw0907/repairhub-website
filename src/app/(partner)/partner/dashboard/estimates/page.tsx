import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { AnswerForm } from "@/components/partner/AnswerForm";

export default async function PartnerEstimatesPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const estimates = await prisma.estimate.findMany({
    where: { companyId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/partner/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          견적 요청 관리
        </h1>
        <div className="space-y-4">
          {estimates.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {e.user.name}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {e.status === "REQUESTED" ? "답변 대기" : "답변 완료"}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                {e.request}
              </p>
              <AnswerForm endpoint={`/api/partner/estimates/${e.id}`} existingAnswer={e.answer} />
            </div>
          ))}
          {estimates.length === 0 && (
            <p className="text-sm text-neutral-500">아직 견적 요청이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
