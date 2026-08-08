"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiInlineAction } from "@/components/ai/AiInlineAction";

export function AdminReportRow({
  report,
}: {
  report: {
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    reporterName: string;
    linkHref: string | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/admin/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {report.targetType}
        </span>
        <span
          className={
            report.status === "PENDING"
              ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "text-xs text-neutral-400"
          }
        >
          {report.status}
        </span>
      </div>
      <p className="mt-2 text-neutral-700 dark:text-neutral-300">{report.reason}</p>
      <p className="mt-1 text-xs text-neutral-500">
        신고자: {report.reporterName}
        {report.linkHref && (
          <>
            {" · "}
            <a href={report.linkHref} className="text-primary underline underline-offset-2">
              대상 보기
            </a>
          </>
        )}
      </p>
      {report.status === "PENDING" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => updateStatus("RESOLVED")}
            disabled={loading}
            className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            처리 완료
          </button>
          <button
            onClick={() => updateStatus("DISMISSED")}
            disabled={loading}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary disabled:opacity-50 dark:border-neutral-700 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
          >
            기각
          </button>
        </div>
      )}

      <AiInlineAction
        endpoint="/api/ai/admin/classify-report"
        body={{ reportId: report.id }}
        buttonLabel="AI 신고 분류"
      />
    </div>
  );
}
