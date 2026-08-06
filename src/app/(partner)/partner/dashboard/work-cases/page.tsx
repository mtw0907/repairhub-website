import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { WorkCaseForm } from "@/components/partner/WorkCaseForm";

export default async function PartnerWorkCasesPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const workCases = await prisma.workCase.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            작업사례 등록
          </h1>
          <WorkCaseForm />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            등록된 작업사례 ({workCases.length})
          </h2>
          <div className="space-y-2.5">
            {workCases.map((w) => {
              const photos: string[] = w.photos ? JSON.parse(w.photos) : [];
              return (
                <div
                  key={w.id}
                  className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{w.title}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">
                    {w.content}
                  </p>
                  {photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {photos.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={url} src={url} alt="작업사례 사진" className="h-16 w-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {workCases.length === 0 && (
              <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
                등록된 작업사례가 없습니다.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
