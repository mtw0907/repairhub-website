import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";

const PAGE_SIZE = 20;

export default async function PartnerRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const session = await auth();
  const companyId = session!.user.companyId!;

  const [completed, totalCompleted] = await Promise.all([
    prisma.reservation.findMany({
      where: { companyId, status: "COMPLETED" },
      include: {
        user: { select: { name: true } },
        statusLogs: { where: { status: "COMPLETED" }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.reservation.count({ where: { companyId, status: "COMPLETED" } }),
  ]);

  // Stats/monthly breakdown need the full completed set, not just this page.
  const allCompleted = await prisma.reservation.findMany({
    where: { companyId, status: "COMPLETED" },
    select: {
      completedAmount: true,
      statusLogs: { where: { status: "COMPLETED" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const dated = allCompleted.map((r) => ({
    amount: r.completedAmount,
    at: r.statusLogs[0]?.createdAt ?? null,
  }));
  const withAmount = dated.filter((r) => r.amount != null) as { amount: number; at: Date | null }[];
  const missingCount = dated.length - withAmount.length;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sum = (rows: typeof withAmount) => rows.reduce((s, r) => s + r.amount, 0);
  const todayRevenue = sum(withAmount.filter((r) => r.at && r.at >= startOfToday));
  const monthRevenue = sum(withAmount.filter((r) => r.at && r.at >= startOfMonth));
  const totalRevenue = sum(withAmount);

  const months: { label: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({
      label: `${from.getMonth() + 1}월`,
      amount: sum(withAmount.filter((r) => r.at && r.at >= from && r.at < to)),
    });
  }
  const maxMonthly = Math.max(...months.map((m) => m.amount), 1);

  const totalPages = Math.max(1, Math.ceil(totalCompleted / PAGE_SIZE));

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            매출 관리
          </h1>
          <Link
            href="/partner/dashboard/subscription"
            className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-primary"
          >
            구독 결제 내역
          </Link>
        </div>

        <p className="mb-6 text-xs text-neutral-500">
          예약을 &quot;완료 처리&quot;할 때 입력한 청구 금액을 집계합니다. 소리수리가 실제 결제를
          중개하지 않으므로, 파트너님의 자체 매출 기록용 통계입니다.
        </p>

        {missingCount > 0 && (
          <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            청구 금액을 입력하지 않은 완료 건 {missingCount}건은 집계에서 제외됐어요. 아래 목록이나{" "}
            <Link href="/partner/dashboard/reservations" className="underline">
              예약 관리
            </Link>
            에서 입력할 수 있어요.
          </p>
        )}

        <div className="grid gap-3.5 sm:grid-cols-2">
          <StatCard label="오늘 매출" value={`${todayRevenue.toLocaleString()}원`} />
          <StatCard label="이번 달 매출" value={`${monthRevenue.toLocaleString()}원`} accent />
          <StatCard label="누적 매출" value={`${totalRevenue.toLocaleString()}원`} />
          <StatCard label="완료 건수" value={`${totalCompleted.toLocaleString()}건`} />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            월별 매출 (최근 6개월)
          </h2>
          <div className="space-y-2.5 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {months.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-xs text-neutral-500">{m.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max((m.amount / maxMonthly) * 100, m.amount > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {m.amount.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            완료된 예약
          </h2>
          <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {completed.map((r) => {
              const completedAt = r.statusLogs[0]?.createdAt ?? r.updatedAt;
              return (
                <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {r.user.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {completedAt.toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span
                    className={
                      r.completedAmount != null
                        ? "font-semibold text-neutral-900 dark:text-neutral-100"
                        : "text-xs text-neutral-400"
                    }
                  >
                    {r.completedAmount != null ? `${r.completedAmount.toLocaleString()}원` : "미입력"}
                  </span>
                </li>
              );
            })}
            {completed.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-neutral-400">
                완료된 예약이 없습니다.
              </li>
            )}
          </ul>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              <Link
                href={`/partner/dashboard/revenue?page=${currentPage - 1}`}
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1
                    ? "pointer-events-none rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-300 dark:border-neutral-800"
                    : "rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-600 hover:border-primary/40 hover:text-primary dark:border-neutral-700 dark:text-neutral-300"
                }
              >
                이전
              </Link>
              <span className="text-xs text-neutral-400">
                {currentPage} / {totalPages}
              </span>
              <Link
                href={`/partner/dashboard/revenue?page=${currentPage + 1}`}
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-300 dark:border-neutral-800"
                    : "rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-600 hover:border-primary/40 hover:text-primary dark:border-neutral-700 dark:text-neutral-300"
                }
              >
                다음
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p
        className={
          accent
            ? "mt-1 text-xl font-extrabold text-accent-foreground dark:text-accent"
            : "mt-1 text-xl font-extrabold text-neutral-900 dark:text-neutral-100"
        }
      >
        {value}
      </p>
    </div>
  );
}
