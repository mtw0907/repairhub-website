import Link from "next/link";
import { Search, CalendarCheck, Sparkles, Star, Wrench, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { AiChatWidget } from "@/components/ai/AiChatWidget";

export default async function UserDashboardPage() {
  const session = await auth();

  return (
    <DashboardShell
      roleLabel="사용자"
      userName={session?.user?.name ?? "사용자"}
      sections={[
        {
          title: "업체 찾기",
          icon: Search,
          items: [
            { label: "업체 검색 · 비교", href: "/companies" },
            { label: "업체 즐겨찾기", href: "/dashboard/favorites" },
            { label: "최근 본 업체", href: "/dashboard/recent-views" },
          ],
        },
        {
          title: "예약 · 견적",
          icon: CalendarCheck,
          items: [
            { label: "예약 조회 · 취소", href: "/dashboard/reservations" },
            { label: "견적 요청 내역", href: "/dashboard/estimates" },
            { label: "내 장비", href: "/dashboard/devices" },
          ],
        },
        {
          title: "AI",
          icon: Sparkles,
          items: [
            { label: "AI 수리 견적 매칭", href: "/dashboard/repair-requests/new" },
            { label: "내 견적 요청 내역", href: "/dashboard/repair-requests" },
            { label: "AI 상담", href: "/dashboard/ai/chat" },
          ],
        },
        {
          title: "후기 · 내 정보",
          icon: Star,
          items: [
            "후기 작성 · 수정 (업체 상세 페이지에서)",
            { label: "회원정보 수정", href: "/dashboard/profile" },
          ],
        },
      ]}
    >
      <div className="mb-8 overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm dark:border-primary/25 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-gradient-to-r from-primary to-primary/85 px-5 py-4 dark:border-primary/25 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-accent">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">AI 어시스턴트에게 바로 물어보기</h2>
              <p className="text-xs text-white/70">수리 증상이나 궁금한 점을 지금 바로 상담해보세요</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-5 sm:p-5">
          <div className="sm:col-span-3">
            <AiChatWidget compact />
          </div>
          <Link
            href="/dashboard/repair-requests/new"
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-center shadow-md transition-transform hover:scale-[1.02] sm:col-span-2"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 text-accent-foreground">
              <Wrench className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xl font-extrabold text-accent-foreground">AI 수리 견적 매칭</p>
              <p className="mt-1 text-sm text-accent-foreground/80">증상 입력하고 업체 견적 받아보기</p>
            </div>
            <span className="mt-1 flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-primary transition-transform group-hover:translate-x-1">
              지금 시작하기
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
