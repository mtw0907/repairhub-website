import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";

export default async function SuperAdminLogsPage() {
  const logs = await prisma.adminActivityLog.findMany({
    include: { admin: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/super-admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          관리자 활동 로그
        </h1>
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                  {log.action}
                </span>
                <span className="text-xs text-neutral-400">
                  {log.createdAt.toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                {log.admin.name} ({log.admin.email})
              </p>
              {log.detail && (
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">{log.detail}</p>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              기록된 활동 로그가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
