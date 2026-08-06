import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { SimpleCrudManager } from "@/components/admin/SimpleCrudManager";

export default async function AdminNoticesPage() {
  const notices = await prisma.notice.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard/content" backLabel="콘텐츠 관리로" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
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
