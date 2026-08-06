import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { SimpleCrudManager } from "@/components/admin/SimpleCrudManager";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard/content" backLabel="콘텐츠 관리로" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          이벤트 관리
        </h1>
        <SimpleCrudManager
          addEndpoint="/api/admin/events"
          deleteEndpointBase="/api/admin/events"
          items={events.map((e) => ({ id: e.id, title: e.title, content: e.content }))}
          fields={[
            { key: "title", label: "제목" },
            { key: "content", label: "내용", type: "textarea" },
          ]}
        />
      </main>
    </div>
  );
}
