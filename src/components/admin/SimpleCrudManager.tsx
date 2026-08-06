"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FieldConfig = { key: string; label: string; type?: "text" | "textarea" };

export function SimpleCrudManager({
  addEndpoint,
  deleteEndpointBase,
  items,
  fields,
}: {
  addEndpoint: string;
  deleteEndpointBase: string;
  items: Record<string, string>[];
  fields: FieldConfig[];
}) {
  const router = useRouter();
  const emptyValues = Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [values, setValues] = useState<Record<string, string>>(emptyValues);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(addEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) {
      setValues(emptyValues);
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
      <ul className="mb-5 space-y-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                {fields.map((f, idx) => (
                  <p
                    key={f.key}
                    className={
                      idx === 0
                        ? "font-semibold text-neutral-900 dark:text-neutral-100"
                        : "mt-1 whitespace-pre-line text-neutral-600 dark:text-neutral-400"
                    }
                  >
                    {item[f.key]}
                  </p>
                ))}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={loading}
                className="whitespace-nowrap text-xs font-medium text-red-600 hover:underline"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-neutral-300 py-10 text-center text-sm text-neutral-500 dark:border-neutral-700">
            등록된 항목이 없습니다.
          </p>
        )}
      </ul>
      <form
        onSubmit={handleAdd}
        className="space-y-2.5 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        {fields.map((f) =>
          f.type === "textarea" ? (
            <textarea
              key={f.key}
              required
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.label}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          ) : (
            <input
              key={f.key}
              required
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.label}
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          ),
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
        >
          추가
        </button>
      </form>
    </div>
  );
}
