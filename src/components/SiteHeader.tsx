import Link from "next/link";
import { auth } from "@/lib/auth";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
            R
          </span>
          <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Repair<span className="text-brand">Hub</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/companies"
            className="hidden font-medium text-neutral-600 transition-colors hover:text-neutral-900 sm:inline dark:text-neutral-400 dark:hover:text-white"
          >
            업체 찾기
          </Link>
          {role ? (
            <Link
              href={ROLE_DASHBOARD_PATH[role]}
              className="rounded-full bg-neutral-900 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              내 대시보드
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-neutral-900 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
