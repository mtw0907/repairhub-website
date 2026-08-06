"use client";

import { useRef, useState } from "react";

const SNAP_VH = [18, 50, 88]; // peek / half / full

export function MobileCompanySheet({ children }: { children: React.ReactNode }) {
  const [snapIndex, setSnapIndex] = useState(1);
  const [dragPx, setDragPx] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const dragging = useRef(false);

  function handlePointerDown(e: React.PointerEvent) {
    dragStartY.current = e.clientY;
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current || dragStartY.current === null) return;
    setDragPx(e.clientY - dragStartY.current);
  }

  function handlePointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    const vh = window.innerHeight / 100;
    const draggedVh = dragPx / vh;
    const currentHeight = SNAP_VH[snapIndex] - draggedVh;

    let nearest = 0;
    let bestDiff = Infinity;
    SNAP_VH.forEach((h, i) => {
      const diff = Math.abs(h - currentHeight);
      if (diff < bestDiff) {
        bestDiff = diff;
        nearest = i;
      }
    });

    setSnapIndex(nearest);
    setDragPx(0);
    dragStartY.current = null;
  }

  const heightVh = SNAP_VH[snapIndex];
  const dragVh = dragging.current ? dragPx / (window.innerHeight / 100) : 0;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden rounded-t-3xl border-t border-neutral-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:border-neutral-800 dark:bg-neutral-900"
      style={{
        height: `${heightVh - dragVh}vh`,
        transition: dragging.current ? "none" : "height 0.25s ease-out",
      }}
    >
      <div
        className="flex shrink-0 cursor-grab touch-none flex-col items-center py-2.5 active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
