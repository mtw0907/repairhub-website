import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

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
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/partner/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          통계
        </h1>

        <div className="grid gap-4 sm:grid-cols-2">
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
          />
          <StatCard
            label="예약 전환율 (승인+완료 / 전체)"
            value={conversionRate !== null ? `${conversionRate.toFixed(0)}%` : "-"}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            예약 상태별 현황
          </h2>
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 text-sm dark:divide-neutral-800 dark:border-neutral-800">
            {reservationsByStatus.map((r) => (
              <li key={r.status} className="flex justify-between px-4 py-2">
                <span>{statusLabel[r.status] ?? r.status}</span>
                <span className="font-medium">{r._count.status}건</span>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
    </div>
  );
}
