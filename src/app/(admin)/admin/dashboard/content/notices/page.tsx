import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { SimpleCrudManager } from "@/components/admin/SimpleCrudManager";

export default async function AdminNoticesPage() {
  const notices = await prisma.notice.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/admin/dashboard/content" className="text-sm text-neutral-500 hover:underline">
          ← 콘텐츠 관리로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          공지사항 관리
        </h1>
        <SimpleCrudManager
          addEndpoint="/api/admin/notices"
          deleteEndpointBase="/api/admin/notices"
          items={notices.map((n) => ({ id: n.id, title: n.title, content: n.content }))}
          fields={[
            { key: "title", label: "제목" },
            { key: "content", label: "내용", type: "textarea" },
          ]}
        />
      </main>
    </div>
  );
}
