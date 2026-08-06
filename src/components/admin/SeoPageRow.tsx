"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPE_PATH: Record<string, string> = {
  REGION: "/regions",
  BRAND: "/brands",
  SYMPTOM: "/symptoms",
};

export function SeoPageRow({
  page,
}: {
  page: { id: string; type: string; keyword: string; title: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/seo-pages/${page.id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{page.title}</p>
        <Link
          href={`${TYPE_PATH[page.type]}/${encodeURIComponent(page.keyword)}`}
          className="text-xs text-primary underline underline-offset-2"
        >
          {TYPE_PATH[page.type]}/{page.keyword}
        </Link>
      </div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs font-medium text-red-600 hover:underline"
      >
        삭제
      </button>
    </div>
  );
}
