import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
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
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          통계
        </h1>
        <div className="grid gap-3.5 sm:grid-cols-2">
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
          <StatCard label="누적 매출" value={`${(revenue._sum.amount ?? 0).toLocaleString()}원`} accent />
          <StatCard label="Pro 구독 중인 업체" value={activeSubscriptionCount.toLocaleString()} />
        </div>

        <div className="mt-8">
          <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            업체 상태별 현황
          </h2>
          <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white text-sm shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {companiesByStatus.map((c) => (
              <li key={c.status} className="flex justify-between px-4 py-2.5">
                <span>{c.status}</span>
                <span className="font-semibold text-primary">{c._count.status}개</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            AI 기능별 사용 현황
          </h2>
          <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white text-sm shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {aiUsageByType.map((a) => (
              <li key={a.type} className="flex justify-between px-4 py-2.5">
                <span>{a.type}</span>
                <span className="font-semibold text-primary">{a._count.type}회</span>
              </li>
            ))}
            {aiUsageByType.length === 0 && (
              <li className="px-4 py-3 text-xs text-neutral-400">아직 AI 사용 기록이 없습니다.</li>
            )}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
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

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={accent ? "mt-1 text-xl font-extrabold text-accent-foreground dark:text-accent" : "mt-1 text-xl font-extrabold text-neutral-900 dark:text-neutral-100"}>
        {value}
      </p>
    </div>
  );
}
