"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { loadDaumPostcodeScript } from "@/lib/daumPostcode";

/**
 * 도로명주소 검색 + 상세주소 입력 필드. Daum 우편번호 위젯을 모달 안에
 * embed()하는 방식이라(팝업 창을 직접 열지 않음) 브라우저 팝업 차단에
 * 걸리지 않음.
 */
export function AddressSearchField({
  baseAddress,
  detailAddress,
  onBaseAddressChange,
  onDetailAddressChange,
  required,
}: {
  baseAddress: string;
  detailAddress: string;
  onBaseAddressChange: (address: string) => void;
  onDetailAddressChange: (detail: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDaumPostcodeScript().catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadDaumPostcodeScript().then(() => {
      if (cancelled || !containerRef.current || !window.daum?.Postcode) return;
      containerRef.current.innerHTML = "";
      new window.daum.Postcode({
        oncomplete: (data: { roadAddress?: string; address: string }) => {
          onBaseAddressChange(data.roadAddress || data.address);
          setOpen(false);
        },
        width: "100%",
        height: "100%",
      }).embed(containerRef.current);
    });
    return () => {
      cancelled = true;
    };
  }, [open, onBaseAddressChange]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          readOnly
          required={required}
          value={baseAddress}
          placeholder="주소 검색 버튼을 눌러주세요"
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-primary/40 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <Search className="h-4 w-4" />
          주소 검색
        </button>
      </div>
      {baseAddress && (
        <input
          value={detailAddress}
          onChange={(e) => onDetailAddressChange(e.target.value)}
          placeholder="상세주소 (동/호수 등, 선택)"
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">주소 검색</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div ref={containerRef} className="h-[450px] w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
