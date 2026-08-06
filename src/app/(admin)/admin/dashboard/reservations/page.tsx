import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AdminReservationRow } from "@/components/admin/AdminReservationRow";

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    include: { user: { select: { name: true } }, company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          예약 관리 (전체)
        </h1>
        <div className="space-y-2.5">
          {reservations.map((r) => (
            <AdminReservationRow
              key={r.id}
              reservation={{
                id: r.id,
                status: r.status,
                scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
                userName: r.user.name,
                companyName: r.company.name,
              }}
            />
          ))}
          {reservations.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              예약 내역이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
