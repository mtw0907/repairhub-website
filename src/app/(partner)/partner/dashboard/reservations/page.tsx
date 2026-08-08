import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { PartnerReservationRow } from "@/components/partner/PartnerReservationRow";

export default async function PartnerReservationsPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const reservations = await prisma.reservation.findMany({
    where: { companyId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          예약 관리
        </h1>
        <div className="space-y-2.5">
          {reservations.map((r) => (
            <PartnerReservationRow
              key={r.id}
              reservation={{
                id: r.id,
                status: r.status,
                method: r.method,
                visitAddress: r.visitAddress,
                scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
                memo: r.memo,
                userName: r.user.name,
                completedAmount: r.completedAmount,
              }}
            />
          ))}
          {reservations.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 예약 내역이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
