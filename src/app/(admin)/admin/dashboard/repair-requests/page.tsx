import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "분석 중",
  ANALYZED: "분석 완료",
  MATCHING: "매칭 중",
  QUOTED: "견적 도착",
  RESERVED: "예약 완료",
  CLOSED: "종료",
};

export default async function AdminRepairRequestsPage() {
  const requests = await prisma.repairRequest.findMany({
    include: { user: { select: { name: true, email: true } }, quotes: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          <Sparkles className="h-6 w-6 text-accent" />
          AI 수리 견적 매칭 요청 관리
        </h1>
        <div className="space-y-2.5">
          {requests.map((r) => {
            const matchedCount = r.matchedCompanyIds
              ? (JSON.parse(r.matchedCompanyIds) as string[]).length
              : 0;
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {r.instrument}{r.brand ? ` · ${r.brand}` : ""} — {r.user.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {r.user.email} · {new Date(r.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    매칭 {matchedCount}곳
                  </span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    견적 {r.quotes.length}건
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
              </div>
            );
          })}
          {requests.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 AI 수리 견적 요청이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
