"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiInlineAction } from "@/components/ai/AiInlineAction";

type AdminCompany = {
  id: string;
  name: string;
  region: string | null;
  status: string;
  isPremium: boolean;
  isFeatured: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인됨",
  SUSPENDED: "정지됨",
  UNVERIFIED: "미인증",
};

export function AdminCompanyRow({ company }: { company: AdminCompany }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/companies/${company.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href={`/companies/${company.id}`} className="font-medium hover:underline">
            {company.name}
          </Link>
          <p className="text-xs text-neutral-500">{company.region}</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {STATUS_LABEL[company.status] ?? company.status}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {(company.status === "PENDING" || company.status === "UNVERIFIED") && (
          <button
            onClick={() => patch({ status: "APPROVED" })}
            disabled={loading}
            className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            승인
          </button>
        )}
        {company.status !== "SUSPENDED" ? (
          <button
            onClick={() => patch({ status: "SUSPENDED" })}
            disabled={loading}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            정지
          </button>
        ) : (
          <button
            onClick={() => patch({ status: "APPROVED" })}
            disabled={loading}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            정지 해제
          </button>
        )}
        <button
          onClick={() => patch({ isPremium: !company.isPremium })}
          disabled={loading}
          className={
            company.isPremium
              ? "rounded-md border border-amber-400 bg-amber-50 px-2 py-1 text-xs text-amber-700 disabled:opacity-50 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-300"
              : "rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          }
        >
          {company.isPremium ? "프리미엄 해제" : "프리미엄 지정"}
        </button>
        <button
          onClick={() => patch({ isFeatured: !company.isFeatured })}
          disabled={loading}
          className={
            company.isFeatured
              ? "rounded-md border border-blue-400 bg-blue-50 px-2 py-1 text-xs text-blue-700 disabled:opacity-50 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-300"
              : "rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          }
        >
          {company.isFeatured ? "추천 해제" : "추천 업체 지정"}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          삭제
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <AiInlineAction
        endpoint="/api/ai/admin/audit-company"
        body={{ companyId: company.id }}
        buttonLabel="AI 검수 · 점수 확인"
      />
    </div>
  );
}
