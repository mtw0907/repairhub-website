import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";

export default async function PartnerStatsPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const [company, reservationsByStatus, inquiryCounts, estimateCount, reviews] =
    await Promise.all([
      prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
      prisma.reservation.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { status: true },
      }),
      prisma.inquiry.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { status: true },
      }),
      prisma.estimate.count({ where: { companyId } }),
      prisma.review.findMany({ where: { companyId, status: "VISIBLE" }, select: { rating: true } }),
    ]);

  const totalReservations = reservationsByStatus.reduce((s, r) => s + r._count.status, 0);
  const converted = reservationsByStatus
    .filter((r) => r.status === "APPROVED" || r.status === "COMPLETED")
    .reduce((s, r) => s + r._count.status, 0);
  const conversionRate = totalReservations > 0 ? (converted / totalReservations) * 100 : null;

  const totalInquiries = inquiryCounts.reduce((s, r) => s + r._count.status, 0);
  const answeredInquiries = inquiryCounts
    .filter((r) => r.status === "ANSWERED")
    .reduce((s, r) => s + r._count.status, 0);

  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;

  const statusLabel: Record<string, string> = {
    REQUESTED: "요청됨",
    APPROVED: "승인됨",
    CHANGED: "변경됨",
    CANCELED: "취소됨",
    COMPLETED: "완료됨",
    NO_SHOW: "노쇼",
  };

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            통계
          </h1>
          <Link
            href="/partner/dashboard/revenue"
            className="text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-primary"
          >
            매출 관리
          </Link>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <StatCard label="누적 조회수" value={company.viewCount.toLocaleString()} />
          <StatCard label="총 예약 수" value={totalReservations.toLocaleString()} />
          <StatCard
            label="문의 수 (답변완료 / 전체)"
            value={`${answeredInquiries} / ${totalInquiries}`}
          />
          <StatCard label="견적 요청 수" value={estimateCount.toLocaleString()} />
          <StatCard
            label="후기 평균 평점"
            value={avgRating ? `★ ${avgRating.toFixed(1)} (${reviewCount})` : "후기 없음"}
            accent
          />
          <StatCard
            label="예약 전환율 (승인+완료 / 전체)"
            value={conversionRate !== null ? `${conversionRate.toFixed(0)}%` : "-"}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            예약 상태별 현황
          </h2>
          <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white text-sm shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {reservationsByStatus.map((r) => (
              <li key={r.status} className="flex justify-between px-4 py-2.5">
                <span>{statusLabel[r.status] ?? r.status}</span>
                <span className="font-semibold text-primary">{r._count.status}건</span>
              </li>
            ))}
            {reservationsByStatus.length === 0 && (
              <li className="px-4 py-3 text-xs text-neutral-400">예약 내역이 없습니다.</li>
            )}
          </ul>
        </div>
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
