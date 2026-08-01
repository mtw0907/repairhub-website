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
    <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {report.targetType}
        </span>
        <span className="text-xs text-neutral-400">{report.status}</span>
      </div>
      <p className="mt-2 text-neutral-700 dark:text-neutral-300">{report.reason}</p>
      <p className="mt-1 text-xs text-neutral-500">
        신고자: {report.reporterName}
        {report.linkHref && (
          <>
            {" · "}
            <a href={report.linkHref} className="underline">
              대상 보기
            </a>
          </>
        )}
      </p>
      {report.status === "PENDING" && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => updateStatus("RESOLVED")}
            disabled={loading}
            className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            처리 완료
          </button>
          <button
            onClick={() => updateStatus("DISMISSED")}
            disabled={loading}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
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
