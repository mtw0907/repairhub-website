import Link from "next/link";
import { CalendarClock, Heart, Home, Search, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";
import { HeaderSearch } from "@/components/HeaderSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const NAV_LINK =
  "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const isUser = role === "USER";
  const name = session?.user?.name;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            R
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-primary sm:inline dark:text-neutral-100">
            Repair<span className="text-accent">Hub</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link href="/" className={NAV_LINK}>
            <Home className="h-4 w-4 md:hidden" />
            <span className="hidden md:inline">홈</span>
          </Link>
          <Link href="/companies" className={NAV_LINK}>
            <Search className="h-4 w-4 md:hidden" />
            <span className="hidden md:inline">업체 찾기</span>
          </Link>
          {isUser && (
            <Link href="/dashboard/repair-requests/new" className={NAV_LINK}>
              <Sparkles className="h-4 w-4 md:hidden" />
              <span className="hidden md:inline">AI 견적</span>
            </Link>
          )}
          {isUser && (
            <Link href="/dashboard/reservations" className={NAV_LINK}>
              <CalendarClock className="h-4 w-4 md:hidden" />
              <span className="hidden md:inline">예약 현황</span>
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <HeaderSearch />
          {role && <NotificationBell />}
          {isUser && (
            <Link
              href="/dashboard/favorites"
              aria-label="찜목록"
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              <Heart className="h-4.5 w-4.5" />
            </Link>
          )}
          {role ? (
            <Link
              href={ROLE_DASHBOARD_PATH[role]}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 sm:pr-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {(name ?? "?").slice(0, 1)}
              </span>
              <span className="hidden text-sm font-medium text-neutral-700 sm:inline dark:text-neutral-200">
                {name ?? (isUser ? "마이페이지" : "내 대시보드")}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] hover:bg-primary/90"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
