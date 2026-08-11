import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-full bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/90 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-accent dark:text-neutral-400"
        >
          <ChevronLeft className="h-4 w-4" />
          홈으로
        </Link>
      </header>
      <NotificationsList />
    </div>
  );
}
