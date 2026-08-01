import Link from "next/link";
import { auth } from "@/lib/auth";
import { ROLE_DASHBOARD_PATH, type Role } from "@/lib/constants";

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <Link href="/" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        RepairHub
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/companies" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
          업체 찾기
        </Link>
        {role ? (
          <Link
            href={ROLE_DASHBOARD_PATH[role]}
            className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            내 대시보드
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
