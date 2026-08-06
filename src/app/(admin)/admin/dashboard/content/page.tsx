import Link from "next/link";
import { Megaphone, HelpCircle, Image as ImageIcon, PartyPopper, ChevronRight } from "lucide-react";
import { StaffPageHeader } from "@/components/StaffPageHeader";

const ITEMS = [
  { href: "/admin/dashboard/content/notices", label: "공지사항", icon: Megaphone },
  { href: "/admin/dashboard/content/faqs", label: "FAQ", icon: HelpCircle },
  { href: "/admin/dashboard/content/banners", label: "배너", icon: ImageIcon },
  { href: "/admin/dashboard/content/events", label: "이벤트", icon: PartyPopper },
];

export default function AdminContentIndexPage() {
  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          콘텐츠 관리
        </h1>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-neutral-200">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
