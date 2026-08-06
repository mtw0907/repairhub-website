import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { SimpleCrudManager } from "@/components/admin/SimpleCrudManager";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard/content" backLabel="콘텐츠 관리로" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          FAQ 관리
        </h1>
        <SimpleCrudManager
          addEndpoint="/api/admin/faqs"
          deleteEndpointBase="/api/admin/faqs"
          items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
          fields={[
            { key: "question", label: "질문" },
            { key: "answer", label: "답변", type: "textarea" },
          ]}
        />
      </main>
    </div>
  );
}
