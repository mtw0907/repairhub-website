import Link from "next/link";
import { Home, User } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function UserPageHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-base font-semibold text-neutral-700 transition-colors hover:bg-accent/10 hover:text-accent dark:text-neutral-200"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Home className="h-4.5 w-4.5" />
        </span>
        홈
      </Link>
      <div className="flex items-center gap-1">
        <Link
          href="/dashboard"
          aria-label="마이페이지"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-accent/10 hover:text-accent dark:text-neutral-400"
        >
          <User className="h-4.5 w-4.5" />
        </Link>
        <NotificationBell />
        <SignOutButton />
      </div>
    </header>
  );
}
