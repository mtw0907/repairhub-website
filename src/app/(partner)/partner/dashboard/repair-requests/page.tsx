import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";

const STATUS_LABEL: Record<string, string> = {
  MATCHING: "견적 대기",
  QUOTED: "견적 제출됨",
  RESERVED: "예약 확정",
};

export default async function PartnerRepairRequestsPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const allActive = await prisma.repairRequest.findMany({
    where: { status: { in: ["MATCHING", "QUOTED", "RESERVED"] } },
    include: {
      quotes: { where: { companyId }, select: { id: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const requests = allActive.filter((r) => {
    const ids: string[] = r.matchedCompanyIds ? JSON.parse(r.matchedCompanyIds) : [];
    return ids.includes(companyId);
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          <Sparkles className="h-6 w-6 text-accent" />
          AI 매칭 견적 요청
        </h1>
        <div className="space-y-2.5">
          {requests.map((r) => {
            const hasQuoted = r.quotes.length > 0;
            return (
              <Link
                key={r.id}
                href={`/partner/dashboard/repair-requests/${r.id}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <p className="font-semibold text-neutral-900 group-hover:text-primary dark:text-neutral-100">
                    {r.instrument}{r.brand ? ` · ${r.brand}` : ""} — {r.user.name}님
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-neutral-500">{r.symptom}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!hasQuoted && r.status === "MATCHING" && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      견적 미제출
                    </span>
                  )}
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            );
          })}
          {requests.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 매칭된 견적 요청이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
