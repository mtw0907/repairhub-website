import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { CancelReservationButton } from "@/components/reservation/CancelReservationButton";
import type { ReservationStatus } from "@/lib/constants";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "요청됨",
  APPROVED: "승인됨",
  CHANGED: "변경됨",
  CANCELED: "취소됨",
  COMPLETED: "완료됨",
  NO_SHOW: "노쇼",
};

export default async function ReservationsPage() {
  const session = await auth();
  const reservations = await prisma.reservation.findMany({
    where: { userId: session!.user.id },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          내 예약 내역
        </h1>
        <div className="space-y-3">
          {reservations.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/companies/${r.company.id}`} className="font-medium hover:underline">
                    {r.company.name}
                  </Link>
                  <p className="mt-1 text-sm text-neutral-500">
                    {r.scheduledAt
                      ? new Date(r.scheduledAt).toLocaleString("ko-KR")
                      : "희망 일시 미지정"}
                  </p>
                  {r.memo && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{r.memo}</p>}
                </div>
                <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {STATUS_LABEL[r.status as ReservationStatus] ?? r.status}
                </span>
              </div>
              {(r.status === "REQUESTED" || r.status === "APPROVED") && (
                <div className="mt-3">
                  <CancelReservationButton reservationId={r.id} />
                </div>
              )}
            </div>
          ))}
          {reservations.length === 0 && (
            <p className="text-sm text-neutral-500">아직 예약 내역이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
