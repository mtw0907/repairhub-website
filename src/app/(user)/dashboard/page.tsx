import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";

export default async function UserDashboardPage() {
  const session = await auth();

  return (
    <DashboardShell
      roleLabel="사용자"
      userName={session?.user?.name ?? "사용자"}
      sections={[
        {
          title: "업체 찾기",
          items: [
            { label: "업체 검색 · 비교", href: "/companies" },
            { label: "업체 즐겨찾기", href: "/dashboard/favorites" },
            { label: "최근 본 업체", href: "/dashboard/recent-views" },
          ],
        },
        {
          title: "예약 · 견적",
          items: [
            { label: "예약 조회 · 취소", href: "/dashboard/reservations" },
            { label: "견적 요청 내역", href: "/dashboard/estimates" },
          ],
        },
        {
          title: "AI",
          items: [
            { label: "AI 고장진단", href: "/dashboard/ai/diagnose" },
            { label: "AI 업체추천", href: "/dashboard/ai/recommend" },
            { label: "AI 예상 수리비", href: "/dashboard/ai/estimate" },
            { label: "AI 상담", href: "/dashboard/ai/chat" },
          ],
        },
        {
          title: "후기 · 내 정보",
          items: [
            "후기 작성 · 수정 (업체 상세 페이지에서)",
            { label: "회원정보 수정", href: "/dashboard/profile" },
          ],
        },
      ]}
    />
  );
}
