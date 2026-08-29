import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "분석 중",
  ANALYZED: "분석 완료",
  MATCHING: "업체 매칭 중",
  QUOTED: "견적 도착",
  RESERVED: "예약 완료",
  CLOSED: "종료",
};

export default async function RepairRequestsPage() {
  const session = await auth();
  const requests = await prisma.repairRequest.findMany({
    where: { userId: session!.user.id },
    include: { quotes: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            <Sparkles className="h-6 w-6 text-accent" />
            내 AI 수리 견적 요청
          </h1>
          <Link
            href="/dashboard/repair-requests/new"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
          >
            + 새 요청
          </Link>
        </div>
        <div className="space-y-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/repair-requests/${r.id}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-primary/25 dark:bg-neutral-900"
            >
              <div>
                <p className="font-semibold text-neutral-900 group-hover:text-accent dark:text-neutral-100">
                  {r.instrument}{r.brand ? ` · ${r.brand}` : ""}
                </p>
                <p className="mt-0.5 line-clamp-1 text-sm text-neutral-500">{r.symptom}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(r.createdAt).toLocaleString("ko-KR")} · 견적 {r.quotes.length}건
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
                <ChevronRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
            </Link>
          ))}
          {requests.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 AI 수리 견적 요청이 없습니다.{" "}
              <Link href="/dashboard/repair-requests/new" className="font-medium text-primary underline underline-offset-2">
                지금 시작하기
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
