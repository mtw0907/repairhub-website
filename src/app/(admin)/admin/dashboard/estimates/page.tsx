import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";

export default async function AdminEstimatesPage() {
  const [estimates, companies] = await Promise.all([
    prisma.estimate.findMany({
      include: { user: { select: { name: true } }, company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        estimates: { select: { status: true } },
      },
    }),
  ]);

  const responseRates = companies
    .map((c) => {
      const total = c.estimates.length;
      const answered = c.estimates.filter((e) => e.status === "ANSWERED").length;
      return {
        id: c.id,
        name: c.name,
        total,
        answered,
        rate: total > 0 ? (answered / total) * 100 : null,
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0));

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          견적 관리
        </h1>

        <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          업체별 응답률
        </h2>
        <ul className="mb-8 divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white text-sm shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {responseRates.map((c) => (
            <li key={c.id} className="flex justify-between px-4 py-2.5">
              <span>{c.name}</span>
              <span className="font-semibold text-primary">
                {c.answered}/{c.total} ({c.rate!.toFixed(0)}%)
              </span>
            </li>
          ))}
          {responseRates.length === 0 && (
            <li className="px-4 py-3 text-xs text-neutral-400">견적 요청 내역이 없습니다.</li>
          )}
        </ul>

        <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          전체 견적 요청
        </h2>
        <div className="space-y-2.5">
          {estimates.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-neutral-200/70 bg-white p-4 text-sm shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {e.company.name} · {e.user.name}
                </span>
                <span
                  className={
                    e.status === "REQUESTED"
                      ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                  }
                >
                  {e.status === "REQUESTED" ? "답변 대기" : "답변 완료"}
                </span>
              </div>
              <p className="mt-1.5 text-neutral-600 dark:text-neutral-400">{e.request}</p>
            </div>
          ))}
          {estimates.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              견적 요청 내역이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
