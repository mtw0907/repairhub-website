import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function UserPageHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-accent dark:text-neutral-400"
      >
        <ChevronLeft className="h-4 w-4" />
        홈
      </Link>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <SignOutButton />
      </div>
    </header>
  );
}
