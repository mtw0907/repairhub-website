import Link from "next/link";
import { Guitar, Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";
import { HeaderSearch } from "@/components/HeaderSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SiteNav } from "@/components/SiteNav";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const isUser = role === "USER";
  const name = session?.user?.name;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Guitar className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl dark:text-neutral-100">
            소리수리
          </span>
        </Link>

        <SiteNav isUser={isUser} />

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
