import Link from "next/link";
import { CalendarClock, ChevronRight, Store, Truck, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";
import { CancelReservationButton } from "@/components/reservation/CancelReservationButton";
import {
  type ReservationStatus,
  type ReservationMethod,
  RESERVATION_STATUS_LABEL as STATUS_LABEL,
  RESERVATION_STATUS_STYLE as STATUS_STYLE,
  RESERVATION_METHOD_LABEL as METHOD_LABEL,
} from "@/lib/constants";

const METHOD_ICON: Record<ReservationMethod, typeof Store> = {
  VISIT: Store,
  ONSITE: Truck,
  COURIER: Package,
};

const CANCELABLE_STATUSES = new Set(["REQUESTED", "APPROVED", "CONFIRMED"]);

export default async function ReservationsPage() {
  const session = await auth();
  const reservations = await prisma.reservation.findMany({
    where: { userId: session!.user.id },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          <CalendarClock className="h-6 w-6 text-accent" />
          내 예약 내역
        </h1>
        <div className="space-y-3">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Link
                href={`/dashboard/reservations/${r.id}`}
                className="group flex items-start justify-between gap-2"
              >
                <div>
                  <p className="flex items-center gap-1.5 font-semibold text-neutral-900 group-hover:text-accent dark:text-neutral-100">
                    {r.company.name}
                    <ChevronRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </p>
                  {(() => {
                    const method = (r.method || "VISIT") as ReservationMethod;
                    const MethodIcon = METHOD_ICON[method] ?? Store;
                    return (
                      <span className="mt-1 flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        <MethodIcon className="h-3 w-3" />
                        {METHOD_LABEL[method] ?? method}
                      </span>
                    );
                  })()}
                  <p className="mt-1 text-sm text-neutral-500">
                    {r.scheduledAt
                      ? new Date(r.scheduledAt).toLocaleString("ko-KR")
                      : "희망 일시 미지정"}
                  </p>
                  {r.memo && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{r.memo}</p>}
                </div>
                <span
                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[r.status as ReservationStatus] ?? "bg-neutral-100 text-neutral-600"}`}
                >
                  {STATUS_LABEL[r.status as ReservationStatus] ?? r.status}
                </span>
              </Link>
              {CANCELABLE_STATUSES.has(r.status) && (
                <div className="mt-3">
                  <CancelReservationButton reservationId={r.id} />
                </div>
              )}
            </div>
          ))}
          {reservations.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 예약 내역이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
