"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReservationStatus } from "@/lib/constants";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  REQUESTED: "요청됨",
  APPROVED: "승인됨",
  CONFIRMED: "확정됨",
  IN_PROGRESS: "수리중",
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
  completedAmount: number | null;
};

export function PartnerReservationRow({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(
    reservation.scheduledAt ? reservation.scheduledAt.slice(0, 16) : "",
  );
  const [memo, setMemo] = useState(reservation.memo ?? "");

  const [completing, setCompleting] = useState(false);
  const [amountInput, setAmountInput] = useState(
    reservation.completedAmount != null ? String(reservation.completedAmount) : "",
  );
  const [editingAmount, setEditingAmount] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    await fetch(`/api/partner/reservations/${reservation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    router.refresh();
  }

  async function updateStatus(status: string) {
    await patch({ status });
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

  async function confirmComplete() {
    const completedAmount = amountInput.trim() === "" ? null : Number(amountInput);
    await patch({ status: "COMPLETED", completedAmount });
    setCompleting(false);
  }

  async function saveAmount() {
    const completedAmount = amountInput.trim() === "" ? null : Number(amountInput);
    await patch({ completedAmount });
    setEditingAmount(false);
  }

  const status = reservation.status as ReservationStatus;
  const isOpen =
    status === "REQUESTED" ||
    status === "APPROVED" ||
    status === "CONFIRMED" ||
    status === "IN_PROGRESS" ||
    status === "CHANGED";

  return (
    <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
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
        <span
          className={
            status === "REQUESTED"
              ? "whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
          }
        >
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      {status === "COMPLETED" && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          {editingAmount ? (
            <>
              <input
                type="number"
                min={0}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="청구 금액(원)"
                className="w-32 rounded-lg border border-neutral-200 bg-surface-muted px-2.5 py-1.5 text-sm outline-none focus:border-primary/40 dark:border-neutral-700 dark:bg-neutral-800"
              />
              <button
                onClick={saveAmount}
                disabled={loading}
                className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                저장
              </button>
              <button
                onClick={() => setEditingAmount(false)}
                disabled={loading}
                className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium dark:border-neutral-700"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <span className="text-neutral-600 dark:text-neutral-400">
                {reservation.completedAmount != null
                  ? `청구 금액: ${reservation.completedAmount.toLocaleString()}원`
                  : "청구 금액 미입력"}
              </span>
              <button
                onClick={() => setEditingAmount(true)}
                className="text-xs font-medium text-primary underline underline-offset-2"
              >
                {reservation.completedAmount != null ? "수정" : "입력"}
              </button>
            </>
          )}
        </div>
      )}

      {editing ? (
        <div className="mt-3 space-y-2">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            placeholder="예약 메모"
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
          <div className="flex gap-2">
            <button
              onClick={saveSchedule}
              disabled={loading}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={loading}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              취소
            </button>
          </div>
        </div>
      ) : completing ? (
        <div className="mt-3 space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            실제 청구 금액 (원) — 매출 관리에 집계됩니다. 비워두면 나중에 입력할 수 있어요.
          </label>
          <input
            type="number"
            min={0}
            autoFocus
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="예: 50000"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <div className="flex gap-2">
            <button
              onClick={confirmComplete}
              disabled={loading}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              완료 확정
            </button>
            <button
              onClick={() => setCompleting(false)}
              disabled={loading}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
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
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                예약 승인
              </button>
            )}
            {status === "APPROVED" && (
              <button
                onClick={() => updateStatus("CONFIRMED")}
                disabled={loading}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                예약 확정
              </button>
            )}
            {status === "CONFIRMED" && (
              <button
                onClick={() => updateStatus("IN_PROGRESS")}
                disabled={loading}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                수리 시작
              </button>
            )}
            {(status === "IN_PROGRESS" || status === "CHANGED") && (
              <button
                onClick={() => setCompleting(true)}
                disabled={loading}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                완료 처리
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              disabled={loading}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              일정/메모 변경
            </button>
            <button
              onClick={() => updateStatus("CANCELED")}
              disabled={loading}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              예약 취소
            </button>
          </div>
        )
      )}
    </div>
  );
}
