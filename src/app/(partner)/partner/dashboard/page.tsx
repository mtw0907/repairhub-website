import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/DashboardShell";

export default async function PartnerDashboardPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const [company, pendingReservations, pendingInquiries, pendingEstimates, reviewCount] =
    companyId
      ? await Promise.all([
          prisma.company.findUnique({ where: { id: companyId } }),
          prisma.reservation.count({ where: { companyId, status: "REQUESTED" } }),
          prisma.inquiry.count({ where: { companyId, status: "OPEN" } }),
          prisma.estimate.count({ where: { companyId, status: "REQUESTED" } }),
          prisma.review.count({ where: { companyId, status: "VISIBLE" } }),
        ])
      : [null, 0, 0, 0, 0];

  return (
    <DashboardShell
      roleLabel="업체 관리자"
      userName={session?.user?.name ?? "파트너"}
      sections={[
        {
          title: "대시보드",
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
            { label: "통계 자세히 보기", href: "/partner/dashboard/stats" },
          ],
        },
        {
          title: "업체 · 서비스 관리",
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
          ],
        },
        {
          title: "작업사례",
          items: [{ label: "작업사례 등록 · 목록", href: "/partner/dashboard/work-cases" }],
        },
        {
          title: "예약 · 문의 · 후기 관리",
          items: [
            { label: "예약 승인 · 변경 · 취소 · 완료", href: "/partner/dashboard/reservations" },
            { label: "견적 답변", href: "/partner/dashboard/estimates" },
            { label: "고객 문의 답변", href: "/partner/dashboard/inquiries" },
            { label: "후기 보기 · 답글 작성", href: "/partner/dashboard/reviews" },
          ],
        },
        {
          title: "AI",
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
    />
  );
}
