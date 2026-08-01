"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReservationStatus } from "@/lib/constants";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "요청됨",
  APPROVED: "승인됨",
  CHANGED: "변경됨",
  CANCELED: "취소됨",
  COMPLETED: "완료됨",
  NO_SHOW: "노쇼",
};

type Reservation = {
  id: string;
  status: string;
  scheduledAt: string | null;
  memo: string | null;
  userName: string;
};

export function PartnerReservationRow({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(
    reservation.scheduledAt ? reservation.scheduledAt.slice(0, 16) : "",
  );
  const [memo, setMemo] = useState(reservation.memo ?? "");

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/partner/reservations/${reservation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function saveSchedule() {
    setLoading(true);
    await fetch(`/api/partner/reservations/${reservation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CHANGED", scheduledAt: scheduledAt || null, memo }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  const status = reservation.status as ReservationStatus;
  const isOpen = status === "REQUESTED" || status === "APPROVED" || status === "CHANGED";

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {reservation.userName}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {reservation.scheduledAt
              ? new Date(reservation.scheduledAt).toLocaleString("ko-KR")
              : "희망 일시 미지정"}
          </p>
          {reservation.memo && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{reservation.memo}</p>
          )}
        </div>
        <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="예약 메모"
            className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <div className="flex gap-2">
            <button
              onClick={saveSchedule}
              disabled={loading}
              className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={loading}
              className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        isOpen && (
          <div className="mt-3 flex flex-wrap gap-2">
            {status === "REQUESTED" && (
              <button
                onClick={() => updateStatus("APPROVED")}
                disabled={loading}
                className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
              >
                예약 승인
              </button>
            )}
            {(status === "APPROVED" || status === "CHANGED") && (
              <button
                onClick={() => updateStatus("COMPLETED")}
                disabled={loading}
                className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
              >
                완료 처리
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              disabled={loading}
              className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              일정/메모 변경
            </button>
            <button
              onClick={() => updateStatus("CANCELED")}
              disabled={loading}
              className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              예약 취소
            </button>
          </div>
        )
      )}
    </div>
  );
}
