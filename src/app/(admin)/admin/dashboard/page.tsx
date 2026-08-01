import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/DashboardShell";

export default async function AdminDashboardPage() {
  const session = await auth();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todaySignups, todayReservations, pendingCompanies, pendingReports, aiUsageCount, revenue] =
    await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.reservation.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.company.count({ where: { status: { in: ["PENDING", "UNVERIFIED"] } } }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.aiUsageLog.count(),
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    ]);

  return (
    <DashboardShell
      roleLabel="관리자"
      userName={session?.user?.name ?? "관리자"}
      sections={[
        {
          title: "대시보드",
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
          ],
        },
        {
          title: "회원 · 업체 관리",
          items: [
            { label: "회원 검색 · 정지 · 삭제", href: "/admin/dashboard/users" },
            { label: "업체 조회 · 승인 · 프리미엄/추천 지정 · 삭제", href: "/admin/dashboard/companies" },
            { label: "업체 직접 등록", href: "/admin/dashboard/companies/new" },
          ],
        },
        {
          title: "예약 · 견적 · 후기 · 신고",
          items: [
            { label: "예약 조회 · 변경 · 노쇼 관리", href: "/admin/dashboard/reservations" },
            { label: "견적 조회 · 업체 응답률", href: "/admin/dashboard/estimates" },
            { label: "후기 숨김 · 삭제", href: "/admin/dashboard/reviews" },
            { label: "신고 처리", href: "/admin/dashboard/reports" },
          ],
        },
        {
          title: "콘텐츠 · 광고 · 구독",
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
          items: [{ label: "AI 지역/브랜드/증상 페이지 생성", href: "/admin/dashboard/seo" }],
        },
        {
          title: "통계",
          items: [{ label: "전체 통계 보기", href: "/admin/dashboard/stats" }],
        },
      ]}
    />
  );
}
