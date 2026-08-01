import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { AiInlineAction } from "@/components/ai/AiInlineAction";

export default async function AdminStatsPage() {
  const [
    userCount,
    partnerCount,
    companyCount,
    reservationCount,
    reviewCount,
    reportCount,
    aiUsageCount,
    aiTokenSum,
    revenue,
    activeSubscriptionCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "PARTNER" } }),
    prisma.company.count(),
    prisma.reservation.count(),
    prisma.review.count({ where: { status: "VISIBLE" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.aiUsageLog.count(),
    prisma.aiUsageLog.aggregate({ _sum: { tokens: true } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  const companiesByStatus = await prisma.company.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const aiUsageByType = await prisma.aiUsageLog.groupBy({
    by: ["type"],
    _count: { type: true },
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          통계
        </h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="일반 사용자 수" value={userCount.toLocaleString()} />
          <StatCard label="업체(파트너) 수" value={partnerCount.toLocaleString()} />
          <StatCard label="등록된 업체 페이지 수" value={companyCount.toLocaleString()} />
          <StatCard label="총 예약 수" value={reservationCount.toLocaleString()} />
          <StatCard label="공개 후기 수" value={reviewCount.toLocaleString()} />
          <StatCard label="처리 대기 신고" value={reportCount.toLocaleString()} />
          <StatCard label="AI 호출 수" value={aiUsageCount.toLocaleString()} />
          <StatCard
            label="AI 사용 토큰 합계"
            value={(aiTokenSum._sum.tokens ?? 0).toLocaleString()}
          />
          <StatCard label="누적 매출" value={`${(revenue._sum.amount ?? 0).toLocaleString()}원`} />
          <StatCard label="Pro 구독 중인 업체" value={activeSubscriptionCount.toLocaleString()} />
        </div>

        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            업체 상태별 현황
          </h2>
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 text-sm dark:divide-neutral-800 dark:border-neutral-800">
            {companiesByStatus.map((c) => (
              <li key={c.status} className="flex justify-between px-4 py-2">
                <span>{c.status}</span>
                <span className="font-medium">{c._count.status}개</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            AI 기능별 사용 현황
          </h2>
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 text-sm dark:divide-neutral-800 dark:border-neutral-800">
            {aiUsageByType.map((a) => (
              <li key={a.type} className="flex justify-between px-4 py-2">
                <span>{a.type}</span>
                <span className="font-medium">{a._count.type}회</span>
              </li>
            ))}
            {aiUsageByType.length === 0 && (
              <li className="px-4 py-3 text-xs text-neutral-400">아직 AI 사용 기록이 없습니다.</li>
            )}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            AI 운영 리포트
          </h2>
          <AiInlineAction
            endpoint="/api/ai/admin/ops-report"
            body={{}}
            buttonLabel="AI 운영 리포트 생성"
          />
        </div>

        <p className="mt-8 text-xs text-neutral-400">
          검색어 통계는 검색 로그 인프라 구축 후 제공됩니다.
        </p>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
    </div>
  );
}
