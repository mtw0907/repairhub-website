import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Megaphone,
  Search,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/DashboardShell";

const REPAIR_REQUEST_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "분석 중",
  ANALYZED: "분석 완료",
  MATCHING: "매칭 중",
  QUOTED: "견적 도착",
  RESERVED: "예약 완료",
  CLOSED: "종료",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    todaySignups,
    todayReservations,
    pendingCompanies,
    pendingReports,
    aiUsageCount,
    revenue,
    activeRepairRequestCount,
    recentRepairRequests,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.reservation.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.company.count({ where: { status: { in: ["PENDING", "UNVERIFIED"] } } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.aiUsageLog.count(),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.repairRequest.count({
      where: { status: { in: ["SUBMITTED", "ANALYZED", "MATCHING", "QUOTED"] } },
    }),
    prisma.repairRequest.findMany({
      include: { user: { select: { name: true } }, quotes: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <DashboardShell
      roleLabel="관리자"
      userName={session?.user?.name ?? "관리자"}
      sections={[
        {
          title: "대시보드",
          icon: LayoutDashboard,
          items: [
            { label: `오늘 가입: ${todaySignups}명`, href: "/admin/dashboard/users" },
            { label: `오늘 예약: ${todayReservations}건`, href: "/admin/dashboard/reservations" },
            {
              label: `승인 대기 업체: ${pendingCompanies}개`,
              href: "/admin/dashboard/companies",
            },
            { label: `처리 대기 신고: ${pendingReports}건`, href: "/admin/dashboard/reports" },
            {
              label: `누적 매출: ${(revenue._sum.amount ?? 0).toLocaleString()}원`,
              href: "/admin/dashboard/subscriptions",
            },
            { label: `AI 사용량: ${aiUsageCount}회`, href: "/admin/dashboard/stats" },
            {
              label: `진행 중인 AI 견적 요청: ${activeRepairRequestCount}건`,
              href: "/admin/dashboard/repair-requests",
            },
          ],
        },
        {
          title: "회원 · 업체 관리",
          icon: Users,
          items: [
            { label: "회원 검색 · 정지 · 삭제", href: "/admin/dashboard/users" },
            { label: "업체 조회 · 승인 · 프리미엄/추천 지정 · 삭제", href: "/admin/dashboard/companies" },
            { label: "업체 직접 등록", href: "/admin/dashboard/companies/new" },
            { label: "내 계정 (비밀번호 변경)", href: "/admin/dashboard/profile" },
          ],
        },
        {
          title: "예약 · 견적 · 후기 · 신고",
          icon: ClipboardList,
          items: [
            { label: "예약 조회 · 변경 · 노쇼 관리", href: "/admin/dashboard/reservations" },
            { label: "견적 조회 · 업체 응답률", href: "/admin/dashboard/estimates" },
            { label: "AI 매칭 견적 요청 관리", href: "/admin/dashboard/repair-requests" },
            { label: "후기 숨김 · 삭제", href: "/admin/dashboard/reviews" },
            { label: "신고 처리", href: "/admin/dashboard/reports" },
          ],
        },
        {
          title: "콘텐츠 · 광고 · 구독",
          icon: Megaphone,
          items: [
            { label: "공지사항 · FAQ · 배너 · 이벤트", href: "/admin/dashboard/content" },
            "광고 등록 · 통계",
            {
              label: "구독(Pro) 관리 · 결제 확인 · 환불",
              href: "/admin/dashboard/subscriptions",
            },
          ],
        },
        {
          title: "SEO",
          icon: Search,
          items: [{ label: "AI 지역/브랜드/증상 페이지 생성", href: "/admin/dashboard/seo" }],
        },
        {
          title: "통계",
          icon: BarChart3,
          items: [{ label: "전체 통계 보기", href: "/admin/dashboard/stats" }],
        },
      ]}
    >
      {recentRepairRequests.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-gradient-to-r from-primary to-primary/85 px-5 py-4 dark:border-neutral-800 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-accent">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white">AI 수리 견적 매칭 현황</h2>
                <p className="text-xs text-white/70">진행 중인 요청 {activeRepairRequestCount}건</p>
              </div>
            </div>
            <Link
              href="/admin/dashboard/repair-requests"
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentRepairRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {r.instrument}
                    {r.brand ? ` · ${r.brand}` : ""}
                    <span className="ml-1.5 font-normal text-neutral-400">{r.user.name}님</span>
                  </p>
                  <p className="line-clamp-1 text-xs text-neutral-500">{r.symptom}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    견적 {r.quotes.length}건
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    {REPAIR_REQUEST_STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
