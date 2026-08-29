"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Store, Truck, Package } from "lucide-react";
import { RESERVATION_METHOD_LABEL, type ReservationMethod } from "@/lib/constants";
import { AddressSearchField } from "@/components/AddressSearchField";
import type { CategoryTreeNode } from "@/lib/categories";
import {
  CategoryInstrumentPicker,
  EMPTY_CATEGORY_SELECTION,
  type CategorySelection,
} from "@/components/repair/CategoryInstrumentPicker";
import { SelectMenu } from "@/components/ui/SelectMenu";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const METHOD_ICON: Record<ReservationMethod, typeof Store> = {
  VISIT: Store,
  ONSITE: Truck,
  COURIER: Package,
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ReservationForm({
  companyId,
  isUser,
  onSiteVisit,
  courierDrop,
  categoryTree,
  devices = [],
}: {
  companyId: string;
  isUser: boolean;
  onSiteVisit: boolean;
  courierDrop: boolean;
  categoryTree: CategoryTreeNode[];
  devices?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableMethods: ReservationMethod[] = [
    "VISIT",
    ...(onSiteVisit ? (["ONSITE"] as const) : []),
    ...(courierDrop ? (["COURIER"] as const) : []),
  ];

  const [method, setMethod] = useState<ReservationMethod>("VISIT");
  const needsSchedule = method !== "COURIER";

  const [selection, setSelection] = useState<CategorySelection>(EMPTY_CATEGORY_SELECTION);
  const { categoryId, categoryName, instrument } = selection;
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [symptom, setSymptom] = useState("");
  const repairInfoComplete = !!categoryId && !!instrument && !!brand.trim() && !!symptom.trim();

  const [viewMonth, setViewMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [addressBase, setAddressBase] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const visitAddress = [addressBase, addressDetail].filter(Boolean).join(" ");
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate || !needsSchedule) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    fetch(`/api/companies/${companyId}/availability?date=${toDateKey(selectedDate)}`)
      .then((res) => res.json())
      .then((data) => setSlots(Array.isArray(data.slots) ? data.slots : []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, companyId, needsSchedule]);

  const firstWeekday = viewMonth.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1)),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isUser) {
      router.push("/login");
      return;
    }
    if (!repairInfoComplete) {
      setMessage("악기/음향기기 종류, 브랜드, 증상을 모두 입력해주세요.");
      return;
    }
    if (needsSchedule && (!selectedDate || !selectedTime)) {
      setMessage("날짜와 시간을 선택해주세요.");
      return;
    }
    if (method === "ONSITE" && !visitAddress.trim()) {
      setMessage("출장 받으실 주소를 입력해주세요.");
      return;
    }
    setLoading(true);
    setMessage(null);

    let scheduledAt: string | null = null;
    if (needsSchedule && selectedDate && selectedTime) {
      const [h, m] = selectedTime.split(":").map(Number);
      const d = new Date(selectedDate);
      d.setHours(h, m, 0, 0);
      scheduledAt = d.toISOString();
    }

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        method,
        scheduledAt,
        visitAddress: method === "ONSITE" || method === "COURIER" ? visitAddress || null : null,
        instrumentCategory: categoryName,
        instrument,
        categoryId,
        deviceId,
        brand,
        symptom,
        memo,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("예약 요청을 보냈습니다. 내 예약 내역에서 상태를 확인하세요.");
      setSelectedDate(null);
      setSelectedTime(null);
      setSlots(null);
      setAddressBase("");
      setAddressDetail("");
      setMemo("");
      setSelection(EMPTY_CATEGORY_SELECTION);
      setDeviceId(null);
      setBrand("");
      setSymptom("");
    } else {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "예약 요청 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">수리 정보</p>
        {devices.length > 0 && (
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-neutral-500">내 장비와 연결 (선택)</label>
            <SelectMenu
              placeholder="연결 안 함"
              value={deviceId ?? ""}
              onChange={(v) => setDeviceId(v || null)}
              options={[{ value: "", label: "연결 안 함" }, ...devices.map((d) => ({ value: d.id, label: d.name }))]}
            />
          </div>
        )}
        <CategoryInstrumentPicker tree={categoryTree} value={selection} onChange={setSelection} />

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-neutral-500">브랜드</label>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="예: Fender, Gibson, Yamaha"
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-neutral-500">고장 증상</label>
          <textarea
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            rows={2}
            placeholder="예: 기타 앰프 연결하면 지직거리는 소리가 납니다."
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      </div>

      {!repairInfoComplete && (
        <p className="rounded-xl bg-surface-muted px-3 py-2.5 text-sm text-neutral-500">
          악기/음향기기 종류, 브랜드, 증상을 입력하면 예약 날짜를 선택할 수 있어요.
        </p>
      )}

      {repairInfoComplete && availableMethods.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">예약 방법</p>
          <div className="grid grid-cols-3 gap-2">
            {availableMethods.map((m) => {
              const Icon = METHOD_ICON[m];
              const active = method === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={
                    active
                      ? "flex flex-col items-center gap-1 rounded-xl border-2 border-primary bg-primary/10 py-3 text-sm font-bold text-primary"
                      : "flex flex-col items-center gap-1 rounded-xl border border-neutral-200 py-3 text-sm text-neutral-600 hover:border-accent/50 dark:border-neutral-700 dark:text-neutral-300"
                  }
                >
                  <Icon className="h-4.5 w-4.5" />
                  {RESERVATION_METHOD_LABEL[m]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {repairInfoComplete && needsSchedule && (
        <>
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                aria-label="이전 달"
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary/70 hover:bg-accent/15"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-bold text-primary dark:text-neutral-100">
                {viewMonth.getFullYear()}년 {viewMonth.getMonth() + 1}월
              </p>
              <button
                type="button"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                aria-label="다음 달"
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary/70 hover:bg-accent/15"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {WEEKDAY_LABELS.map((w) => (
                <div key={w} className="py-1 font-medium text-neutral-400">
                  {w}
                </div>
              ))}
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const isPast = date < today;
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isPast}
                    onClick={() => setSelectedDate(date)}
                    className={
                      isSelected
                        ? "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                        : isPast
                          ? "flex h-8 w-8 items-center justify-center rounded-full text-xs text-neutral-300 dark:text-neutral-700"
                          : isToday
                            ? "flex h-8 w-8 items-center justify-center rounded-full border border-primary/50 text-xs font-semibold text-primary transition-colors hover:bg-accent/15 dark:hover:bg-accent/25 dark:hover:text-accent"
                            : "flex h-8 w-8 items-center justify-center rounded-full text-xs text-neutral-700 transition-colors hover:bg-accent/15 hover:text-accent dark:text-neutral-300 dark:hover:bg-accent/20 dark:hover:text-accent"
                    }
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">시간 선택</p>
              {loadingSlots ? (
                <p className="text-sm text-neutral-400">불러오는 중...</p>
              ) : slots && slots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={
                        selectedTime === t
                          ? "rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground"
                          : "rounded-xl border border-neutral-200 py-2 text-sm text-neutral-700 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent/40 dark:hover:bg-accent/15 dark:hover:text-accent"
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-surface-muted px-3 py-2.5 text-sm text-neutral-500">
                  선택하신 날짜에 예약 가능한 시간이 없습니다.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {repairInfoComplete && method === "ONSITE" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            출장 받으실 주소
          </label>
          <AddressSearchField
            required
            baseAddress={addressBase}
            detailAddress={addressDetail}
            onBaseAddressChange={setAddressBase}
            onDetailAddressChange={setAddressDetail}
          />
        </div>
      )}

      {repairInfoComplete && method === "COURIER" && (
        <div className="space-y-3">
          <p className="rounded-xl bg-surface-muted px-3 py-2.5 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            택배 접수는 별도 방문 일정이 필요 없어요. 업체가 예약을 승인하면 발송 안내를 보내드립니다.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              수리 후 반송 받으실 주소 (선택)
            </label>
            <AddressSearchField
              baseAddress={addressBase}
              detailAddress={addressDetail}
              onBaseAddressChange={setAddressBase}
              onDetailAddressChange={setAddressDetail}
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          요청 사항 (선택)
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <p className="text-xs text-neutral-400">
        업체 페이지의 가격표는 참고용이며, 실제 수리 비용은 방문/점검 후 업체와 협의해 확정됩니다.
      </p>

      {message && <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}

      <button
        type="submit"
        disabled={loading || !repairInfoComplete}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "요청 중..." : "예약 요청하기"}
      </button>
    </form>
  );
}
