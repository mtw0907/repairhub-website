import { Clock, ShieldAlert } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

type AiResult =
  | { ok: true; looksLikeCertificate?: boolean; confidence?: string; notes?: string }
  | { ok: false; reason?: string };

export function PendingApprovalNotice({
  status,
  aiVerificationResult,
}: {
  status: string;
  aiVerificationResult: string | null;
}) {
  const isSuspended = status === "SUSPENDED";
  let ai: AiResult | null = null;
  try {
    ai = aiVerificationResult ? JSON.parse(aiVerificationResult) : null;
  } catch {
    ai = null;
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-surface-muted px-4 py-12">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-neutral-200/70 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <span
          className={
            isSuspended
              ? "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
              : "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent"
          }
        >
          {isSuspended ? <ShieldAlert className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
        </span>

        <div>
          <h1 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
            {isSuspended ? "이용이 제한되었습니다" : "업체 승인 심사 중입니다"}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            {isSuspended
              ? "이용 제한 사유가 궁금하시면 고객센터로 문의해주세요."
              : "제출하신 사업자등록증을 관리자가 검토 중입니다. 승인이 완료되면 대시보드 전체 기능을 이용하실 수 있어요."}
          </p>
        </div>

        {ai && (
          <div className="rounded-xl bg-surface-muted p-4 text-left text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <p className="mb-1 font-bold text-neutral-900 dark:text-neutral-100">AI 1차 검토 결과 (참고용)</p>
            {ai.ok ? (
              <>
                <p>증명서 형식 인식: {ai.looksLikeCertificate ? "예" : "아니오"}</p>
                {ai.confidence && <p>신뢰도: {ai.confidence}</p>}
                {ai.notes && <p className="mt-1 whitespace-pre-line">{ai.notes}</p>}
              </>
            ) : (
              <p>AI 검증을 완료하지 못했습니다{ai.reason ? ` (${ai.reason})` : ""} — 관리자가 직접 검토합니다.</p>
            )}
          </div>
        )}

        <SignOutButton />
      </div>
    </div>
  );
}
