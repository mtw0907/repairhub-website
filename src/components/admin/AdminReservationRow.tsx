"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RESERVATION_STATUSES } from "@/lib/constants";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "요청됨",
  APPROVED: "승인됨",
  CHANGED: "변경됨",
  CANCELED: "취소됨",
  COMPLETED: "완료됨",
  NO_SHOW: "노쇼",
};

export function AdminReservationRow({
  reservation,
}: {
  reservation: {
    id: string;
    status: string;
    scheduledAt: string | null;
    userName: string;
    companyName: string;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(status: string) {
    setLoading(true);
    await fetch(`/api/admin/reservations/${reservation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {reservation.companyName} · {reservation.userName}
        </p>
        <p className="text-xs text-neutral-500">
          {reservation.scheduledAt
            ? new Date(reservation.scheduledAt).toLocaleString("ko-KR")
            : "희망 일시 미지정"}
        </p>
      </div>
      <select
        value={reservation.status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      >
        {RESERVATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
