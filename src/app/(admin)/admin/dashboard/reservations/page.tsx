import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { AdminReservationRow } from "@/components/admin/AdminReservationRow";

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    include: { user: { select: { name: true } }, company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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
          예약 관리 (전체)
        </h1>
        <div className="space-y-2">
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
            <p className="text-sm text-neutral-500">예약 내역이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
