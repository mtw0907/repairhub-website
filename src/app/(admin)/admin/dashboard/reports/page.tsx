import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AdminReportRow } from "@/components/admin/AdminReportRow";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { name: true } },
      review: { select: { companyId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          신고 관리
        </h1>
        <div className="space-y-2.5">
          {reports.map((r) => (
            <AdminReportRow
              key={r.id}
              report={{
                id: r.id,
                targetType: r.targetType,
                targetId: r.targetId,
                reason: r.reason,
                status: r.status,
                reporterName: r.reporter.name,
                linkHref:
                  r.targetType === "COMPANY"
                    ? `/companies/${r.targetId}`
                    : r.targetType === "REVIEW" && r.review
                      ? `/companies/${r.review.companyId}`
                      : null,
              }}
            />
          ))}
          {reports.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              접수된 신고가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
