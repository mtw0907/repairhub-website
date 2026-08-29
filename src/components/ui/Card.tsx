import type { ComponentPropsWithoutRef } from "react";

// 숨고/오늘의집/네이버예약 톤의 표준 카드 셸 — 화이트 배경, 옅은 보더, 은은한
// 그림자. 장식적 그라데이션/글래스 효과는 쓰지 않는다. hoverable을 켜면
// 클릭 가능한 카드(살짝 떠오르는 hover)로 동작한다.
export function Card({
  hoverable = false,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div"> & { hoverable?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-primary/15 bg-white shadow-sm dark:border-primary/25 dark:bg-neutral-900 ${
        hoverable
          ? "transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
          : ""
      } ${className}`}
      {...props}
    />
  );
}
