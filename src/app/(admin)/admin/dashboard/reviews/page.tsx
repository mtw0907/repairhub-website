import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AdminReviewRow } from "@/components/admin/AdminReviewRow";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: { not: "DELETED" } },
    include: { user: { select: { name: true } }, company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          후기 관리
        </h1>
        <div className="space-y-2.5">
          {reviews.map((r) => (
            <AdminReviewRow
              key={r.id}
              review={{
                id: r.id,
                userName: r.user.name,
                companyName: r.company.name,
                rating: r.rating,
                content: r.content,
                status: r.status,
              }}
            />
          ))}
          {reviews.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              등록된 후기가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
