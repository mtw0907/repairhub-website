"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PriceItemManager({
  items,
}: {
  items: { id: string; label: string; price: number }[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !price) return;
    setLoading(true);
    const res = await fetch("/api/partner/price-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label.trim(), price: Number(price) }),
    });
    setLoading(false);
    if (res.ok) {
      setLabel("");
      setPrice("");
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await fetch(`/api/partner/price-items/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <h3 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
        가격표
      </h3>
      <ul className="mb-3 divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white text-sm shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between px-4 py-2.5">
            <span>{item.label}</span>
            <span className="flex items-center gap-3">
              <span className="font-semibold text-primary">{item.price.toLocaleString()}원</span>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={loading}
                className="text-xs font-medium text-neutral-400 hover:text-red-600"
              >
                삭제
              </button>
            </span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-4 py-3 text-xs text-neutral-400">등록된 가격이 없습니다.</li>
        )}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="항목명 (예: 넥 조정)"
          className="flex-1 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="가격"
          className="w-28 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          추가
        </button>
      </form>
    </div>
  );
}
