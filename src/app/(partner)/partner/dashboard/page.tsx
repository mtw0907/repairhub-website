import Link from "next/link";
import { LayoutDashboard, Store, Camera, ClipboardList, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/DashboardShell";

export default async function PartnerDashboardPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const [company, pendingReservations, pendingInquiries, pendingEstimates, reviewCount, activeRepairRequests] =
    companyId
      ? await Promise.all([
          prisma.company.findUnique({ where: { id: companyId } }),
          prisma.reservation.count({ where: { companyId, status: "REQUESTED" } }),
          prisma.inquiry.count({ where: { companyId, status: "OPEN" } }),
          prisma.estimate.count({ where: { companyId, status: "REQUESTED" } }),
          prisma.review.count({ where: { companyId, status: "VISIBLE" } }),
          prisma.repairRequest.findMany({
            where: { status: { in: ["MATCHING", "QUOTED"] } },
            include: { quotes: { where: { companyId } }, user: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          }),
        ])
      : [null, 0, 0, 0, 0, []];

  const matchedRepairRequests = activeRepairRequests.filter((r) => {
    const ids: string[] = r.matchedCompanyIds ? JSON.parse(r.matchedCompanyIds) : [];
    return companyId ? ids.includes(companyId) : false;
  });
  const pendingRepairRequestCount = matchedRepairRequests.filter((r) => r.quotes.length === 0).length;
  const recentRepairRequests = matchedRepairRequests.slice(0, 3);

  return (
    <DashboardShell
      roleLabel="업체 관리자"
      userName={session?.user?.name ?? "파트너"}
      sections={[
        {
          title: "대시보드",
          icon: LayoutDashboard,
          items: [
            { label: `누적 조회수: ${company?.viewCount ?? 0}`, href: "/partner/dashboard/stats" },
            {
              label: `예약 현황: 승인 대기 ${pendingReservations}건`,
              href: "/partner/dashboard/reservations",
            },
            {
              label: `문의 현황: 답변 대기 ${pendingInquiries}건`,
              href: "/partner/dashboard/inquiries",
            },
            { label: `견적 현황: 답변 대기 ${pendingEstimates}건`, href: "/partner/dashboard/estimates" },
            { label: `후기 현황: ${reviewCount}건`, href: "/partner/dashboard/reviews" },
            { label: "매출 관리", href: "/partner/dashboard/revenue" },
            { label: "통계 자세히 보기", href: "/partner/dashboard/stats" },
          ],
        },
        {
          title: "업체 · 서비스 관리",
          icon: Store,
          items: [
            {
              label: "업체정보 · 영업시간 · 휴무일 · 출장/택배 수정",
              href: "/partner/dashboard/company",
            },
            { label: "수리 품목 · 브랜드 · 가격표 관리", href: "/partner/dashboard/company" },
            {
              label: company?.isPremium ? "구독 관리 (Pro 이용 중)" : "구독 관리 (Pro 구독하기)",
              href: "/partner/dashboard/subscription",
            },
            { label: "내 계정 (비밀번호 변경)", href: "/partner/dashboard/profile" },
          ],
        },
        {
          title: "작업사례",
          icon: Camera,
          items: [{ label: "작업사례 등록 · 목록", href: "/partner/dashboard/work-cases" }],
        },
        {
          title: "예약 · 문의 · 후기 관리",
          icon: ClipboardList,
          items: [
            { label: "예약 승인 · 변경 · 취소 · 완료", href: "/partner/dashboard/reservations" },
            { label: "견적 답변", href: "/partner/dashboard/estimates" },
            {
              label: `AI 매칭 견적 요청: 답변 대기 ${pendingRepairRequestCount}건`,
              href: "/partner/dashboard/repair-requests",
            },
            { label: "고객 문의 답변", href: "/partner/dashboard/inquiries" },
            { label: "후기 보기 · 답글 작성", href: "/partner/dashboard/reviews" },
          ],
        },
        {
          title: "AI",
          icon: Sparkles,
          items: [
            { label: "AI 블로그 작성", href: "/partner/dashboard/ai/blog" },
            { label: "AI 광고 문구", href: "/partner/dashboard/ai/ad-copy" },
            { label: "AI FAQ 생성", href: "/partner/dashboard/ai/faq" },
            { label: "AI 고객 상담", href: "/partner/dashboard/ai/customer-chat" },
            {
              label: "AI 작업사례 문구 생성 (작업사례 등록 화면에서)",
              href: "/partner/dashboard/work-cases",
            },
            { label: "AI 후기 답변 (후기 관리 화면에서)", href: "/partner/dashboard/reviews" },
          ],
        },
      ]}
    >
      {matchedRepairRequests.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-gradient-to-r from-primary to-primary/85 px-5 py-4 dark:border-neutral-800 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-accent">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white">AI 매칭 견적 요청</h2>
                <p className="text-xs text-white/70">
                  답변 대기 {pendingRepairRequestCount}건 · 전체 {matchedRepairRequests.length}건
                </p>
              </div>
            </div>
            <Link
              href="/partner/dashboard/repair-requests"
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentRepairRequests.map((r) => (
              <Link
                key={r.id}
                href={`/partner/dashboard/repair-requests/${r.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-accent/10 dark:hover:bg-accent/15 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {r.instrument}
                    {r.brand ? ` · ${r.brand}` : ""}
                    <span className="ml-1.5 font-normal text-neutral-400">{r.user.name}님</span>
                  </p>
                  <p className="line-clamp-1 text-xs text-neutral-500">{r.symptom}</p>
                </div>
                <span
                  className={
                    r.quotes.length > 0
                      ? "shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                      : "shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }
                >
                  {r.quotes.length > 0 ? "답변 완료" : "답변 대기"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
