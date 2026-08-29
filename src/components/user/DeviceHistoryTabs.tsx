"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Store, Truck, Package, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  type ReservationStatus,
  type ReservationMethod,
  RESERVATION_STATUS_LABEL,
  RESERVATION_STATUS_STYLE,
  RESERVATION_METHOD_LABEL,
} from "@/lib/constants";

const METHOD_ICON: Record<ReservationMethod, typeof Store> = {
  VISIT: Store,
  ONSITE: Truck,
  COURIER: Package,
};

export type DeviceReservation = {
  id: string;
  companyName: string;
  status: string;
  method: string;
  scheduledAt: string | null;
};

export type DeviceRepairRequest = {
  id: string;
  status: string;
  symptom: string;
  createdAt: string;
};

export type DeviceReview = {
  id: string;
  companyName: string;
  rating: number;
  content: string;
  createdAt: string;
};

type TabKey = "repair" | "reservation" | "estimate" | "review";

// "수리 이력"은 완료된(COMPLETED) 예약만, "예약 이력"은 전체 예약.
export function DeviceHistoryTabs({
  reservations,
  repairRequests,
  reviews,
}: {
  reservations: DeviceReservation[];
  repairRequests: DeviceRepairRequest[];
  reviews: DeviceReview[];
}) {
  const [tab, setTab] = useState<TabKey>("repair");
  const completed = reservations.filter((r) => r.status === "COMPLETED");

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: "repair", label: "수리 이력", count: completed.length },
    { key: "reservation", label: "예약 이력", count: reservations.length },
    { key: "estimate", label: "견적 이력", count: repairRequests.length },
    { key: "review", label: "리뷰", count: reviews.length },
  ];

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-2xl border border-primary/15 bg-white p-1.5 shadow-sm dark:border-primary/25 dark:bg-neutral-900">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                active
                  ? "flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-bold text-primary-foreground"
                  : "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-accent/10 hover:text-accent dark:text-neutral-400"
              }
            >
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {tab === "repair" &&
          (completed.length > 0 ? (
            completed.map((r) => <ReservationRow key={r.id} r={r} />)
          ) : (
            <EmptyState title="완료된 수리 이력이 없어요." />
          ))}

        {tab === "reservation" &&
          (reservations.length > 0 ? (
            reservations.map((r) => <ReservationRow key={r.id} r={r} />)
          ) : (
            <EmptyState title="예약 이력이 없어요." />
          ))}

        {tab === "estimate" &&
          (repairRequests.length > 0 ? (
            repairRequests.map((rr) => (
              <Link
                key={rr.id}
                href={`/dashboard/repair-requests/${rr.id}`}
                className="group flex items-center justify-between gap-2 rounded-2xl border border-primary/15 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-primary/25 dark:bg-neutral-900"
              >
                <p className="line-clamp-1 text-sm text-neutral-700 group-hover:text-accent dark:text-neutral-300">
                  {rr.symptom}
                </p>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-accent" />
              </Link>
            ))
          ) : (
            <EmptyState title="견적 요청 이력이 없어요." />
          ))}

        {tab === "review" &&
          (reviews.length > 0 ? (
            reviews.map((rv) => (
              <div
                key={rv.id}
                className="rounded-2xl border border-primary/15 bg-white p-4 shadow-sm dark:border-primary/25 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{rv.companyName}</p>
                  <span className="flex items-center gap-0.5 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5" fill={i < rv.rating ? "currentColor" : "none"} />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{rv.content}</p>
              </div>
            ))
          ) : (
            <EmptyState title="이 장비와 관련된 리뷰가 없어요." />
          ))}
      </div>
    </div>
  );
}

function ReservationRow({ r }: { r: DeviceReservation }) {
  const method = (r.method || "VISIT") as ReservationMethod;
  const MethodIcon = METHOD_ICON[method] ?? Store;
  return (
    <div className="flex items-start justify-between gap-2 rounded-2xl border border-primary/15 bg-white p-4 shadow-sm dark:border-primary/25 dark:bg-neutral-900">
      <div>
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{r.companyName}</p>
        <span className="mt-1 flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
          <MethodIcon className="h-3 w-3" />
          {RESERVATION_METHOD_LABEL[method] ?? method}
        </span>
        <p className="mt-1 text-sm text-neutral-500">
          {r.scheduledAt ? new Date(r.scheduledAt).toLocaleString("ko-KR") : "희망 일시 미지정"}
        </p>
      </div>
      <span
        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
          RESERVATION_STATUS_STYLE[r.status as ReservationStatus] ?? "bg-neutral-100 text-neutral-600"
        }`}
      >
        {RESERVATION_STATUS_LABEL[r.status as ReservationStatus] ?? r.status}
      </span>
    </div>
  );
}
