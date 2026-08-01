import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

export default async function SuperAdminLogsPage() {
  const logs = await prisma.adminActivityLog.findMany({
    include: { admin: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/super-admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          관리자 활동 로그
        </h1>
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  {log.action}
                </span>
                <span className="text-xs text-neutral-400">
                  {log.createdAt.toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {log.admin.name} ({log.admin.email})
              </p>
              {log.detail && (
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">{log.detail}</p>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-sm text-neutral-500">기록된 활동 로그가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
