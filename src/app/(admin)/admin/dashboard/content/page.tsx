import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default function AdminContentIndexPage() {
  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          콘텐츠 관리
        </h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { href: "/admin/dashboard/content/notices", label: "공지사항" },
            { href: "/admin/dashboard/content/faqs", label: "FAQ" },
            { href: "/admin/dashboard/content/banners", label: "배너" },
            { href: "/admin/dashboard/content/events", label: "이벤트" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-neutral-200 bg-white p-4 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
