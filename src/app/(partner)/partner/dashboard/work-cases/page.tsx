import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { WorkCaseForm } from "@/components/partner/WorkCaseForm";

export default async function PartnerWorkCasesPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const workCases = await prisma.workCase.findMany({
    where: { companyId },
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
      <main className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        <div>
          <h1 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            작업사례 등록
          </h1>
          <WorkCaseForm />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            등록된 작업사례 ({workCases.length})
          </h2>
          <div className="space-y-3">
            {workCases.map((w) => {
              const photos: string[] = w.photos ? JSON.parse(w.photos) : [];
              return (
                <div
                  key={w.id}
                  className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">{w.title}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">
                    {w.content}
                  </p>
                  {photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {photos.map((url) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={url} src={url} alt="작업사례 사진" className="h-16 w-16 rounded object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {workCases.length === 0 && (
              <p className="text-sm text-neutral-500">등록된 작업사례가 없습니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
