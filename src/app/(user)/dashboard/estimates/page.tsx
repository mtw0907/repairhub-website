import Link from "next/link";
import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";

export default async function EstimatesPage() {
  const session = await auth();
  const estimates = await prisma.estimate.findMany({
    where: { userId: session!.user.id },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          <FileText className="h-6 w-6 text-accent" />
          내 견적 요청
        </h1>
        <div className="space-y-3">
          {estimates.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/companies/${e.company.id}`}
                  className="font-semibold text-neutral-900 hover:text-accent hover:underline dark:text-neutral-100"
                >
                  {e.company.name}
                </Link>
                <span
                  className={
                    e.status === "REQUESTED"
                      ? "whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : e.status === "ANSWERED"
                        ? "whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                        : "whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800"
                  }
                >
                  {e.status === "REQUESTED" ? "답변 대기" : e.status === "ANSWERED" ? "답변 완료" : "종료"}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                {e.request}
              </p>
              {e.answer && (
                <div className="mt-3 rounded-xl bg-surface-muted p-3 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <p className="mb-1 text-xs font-bold">업체 답변</p>
                  {e.answer}
                </div>
              )}
            </div>
          ))}
          {estimates.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 견적 요청 내역이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
