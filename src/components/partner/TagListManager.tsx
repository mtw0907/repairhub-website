"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TagListManager({
  title,
  addEndpoint,
  deleteEndpointBase,
  items,
  placeholder,
}: {
  title: string;
  addEndpoint: string;
  deleteEndpointBase: string;
  items: { id: string; name: string }[];
  placeholder: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    const res = await fetch(addEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      setValue("");
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await fetch(`${deleteEndpointBase}/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {item.name}
            <button
              onClick={() => handleDelete(item.id)}
              disabled={loading}
              className="text-neutral-400 hover:text-red-600"
              aria-label={`${item.name} 삭제`}
            >
              ×
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-neutral-400">없음</span>}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          추가
        </button>
      </form>
    </div>
  );
}
