import Link from "next/link";
import { History, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";

export default async function RecentViewsPage() {
  const session = await auth();
  const recentViews = await prisma.recentView.findMany({
    where: { userId: session!.user.id },
    include: { company: true },
    orderBy: { viewedAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          <History className="h-6 w-6 text-accent" />
          최근 본 업체
        </h1>
        <div className="space-y-3">
          {recentViews.map((v) => (
            <Link
              key={v.id}
              href={`/companies/${v.company.id}`}
              className="group flex items-center justify-between rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div>
                <p className="font-semibold text-neutral-900 group-hover:text-primary dark:text-neutral-100">
                  {v.company.name}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {new Date(v.viewedAt).toLocaleString("ko-KR")}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
          {recentViews.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 조회한 업체가 없습니다.{" "}
              <Link href="/companies" className="font-medium text-primary underline underline-offset-2">
                업체 찾기
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
