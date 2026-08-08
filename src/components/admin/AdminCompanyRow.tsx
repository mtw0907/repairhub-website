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
  certificateUrl?: string | null;
  aiVerificationResult?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인됨",
  SUSPENDED: "정지됨",
  UNVERIFIED: "미인증",
};

type AiCertResult =
  | {
      ok: true;
      looksLikeCertificate?: boolean;
      nameMatch?: boolean;
      bizRegNoMatch?: boolean;
      ownerNameMatch?: boolean;
      confidence?: string;
      notes?: string;
    }
  | { ok: false; reason?: string };

function parseAiResult(raw?: string | null): AiCertResult | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AdminCompanyRow({ company }: { company: AdminCompany }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ai = parseAiResult(company.aiVerificationResult);

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
    <div className="rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href={`/companies/${company.id}`} className="font-semibold text-neutral-900 hover:text-primary hover:underline dark:text-neutral-100">
            {company.name}
          </Link>
          <p className="text-xs text-neutral-500">{company.region}</p>
        </div>
        <span
          className={
            company.status === "APPROVED"
              ? "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800"
          }
        >
          {STATUS_LABEL[company.status] ?? company.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(company.status === "PENDING" || company.status === "UNVERIFIED") && (
          <button
            onClick={() => patch({ status: "APPROVED" })}
            disabled={loading}
            className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            승인
          </button>
        )}
        {company.status !== "SUSPENDED" ? (
          <button
            onClick={() => patch({ status: "SUSPENDED" })}
            disabled={loading}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary disabled:opacity-50 dark:border-neutral-700 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
          >
            정지
          </button>
        ) : (
          <button
            onClick={() => patch({ status: "APPROVED" })}
            disabled={loading}
            className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary disabled:opacity-50 dark:border-neutral-700 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
          >
            정지 해제
          </button>
        )}
        <button
          onClick={() => patch({ isPremium: !company.isPremium })}
          disabled={loading}
          className={
            company.isPremium
              ? "rounded-lg border border-accent/50 bg-accent/10 px-2.5 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50 dark:text-accent"
              : "rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary disabled:opacity-50 dark:border-neutral-700 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
          }
        >
          {company.isPremium ? "프리미엄 해제" : "프리미엄 지정"}
        </button>
        <button
          onClick={() => patch({ isFeatured: !company.isFeatured })}
          disabled={loading}
          className={
            company.isFeatured
              ? "rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary disabled:opacity-50"
              : "rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary disabled:opacity-50 dark:border-neutral-700 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
          }
        >
          {company.isFeatured ? "추천 해제" : "추천 업체 지정"}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          삭제
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {(company.certificateUrl || ai) && (
        <div className="mt-3 flex flex-wrap items-start gap-3 rounded-xl bg-surface-muted p-3 dark:bg-neutral-800">
          {company.certificateUrl && (
            <a href={company.certificateUrl} target="_blank" rel="noreferrer" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company.certificateUrl}
                alt="사업자등록증"
                className="h-16 w-16 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
              />
            </a>
          )}
          {ai && (
            <div className="min-w-0 flex-1 text-xs text-neutral-600 dark:text-neutral-300">
              <p className="font-bold text-neutral-900 dark:text-neutral-100">AI 1차 검토 (참고용)</p>
              {ai.ok ? (
                <>
                  <p>
                    증명서 형식: {ai.looksLikeCertificate ? "인식됨" : "미인식"} · 상호명 일치:{" "}
                    {ai.nameMatch ? "예" : "아니오"} · 사업자번호 일치: {ai.bizRegNoMatch ? "예" : "아니오"} · 대표자명
                    일치: {ai.ownerNameMatch ? "예" : "아니오"}
                  </p>
                  {ai.confidence && <p>신뢰도: {ai.confidence}</p>}
                  {ai.notes && <p className="mt-0.5 whitespace-pre-line">{ai.notes}</p>}
                </>
              ) : (
                <p>AI 검증 불가{ai.reason ? ` (${ai.reason})` : ""} — 이미지·기재사항을 직접 확인해주세요.</p>
              )}
            </div>
          )}
        </div>
      )}

      <AiInlineAction
        endpoint="/api/ai/admin/audit-company"
        body={{ companyId: company.id }}
        buttonLabel="AI 검수 · 점수 확인"
      />
    </div>
  );
}
