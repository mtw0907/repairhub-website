import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
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
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          견적 요청 관리
        </h1>
        <div className="space-y-3">
          {estimates.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {e.user.name}
                </span>
                <span
                  className={
                    e.status === "REQUESTED"
                      ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                  }
                >
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
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 견적 요청이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
