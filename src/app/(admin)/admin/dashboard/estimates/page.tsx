import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

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
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          견적 관리
        </h1>

        <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          업체별 응답률
        </h2>
        <ul className="mb-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200 text-sm dark:divide-neutral-800 dark:border-neutral-800">
          {responseRates.map((c) => (
            <li key={c.id} className="flex justify-between px-4 py-2">
              <span>{c.name}</span>
              <span className="font-medium">
                {c.answered}/{c.total} ({c.rate!.toFixed(0)}%)
              </span>
            </li>
          ))}
          {responseRates.length === 0 && (
            <li className="px-4 py-3 text-xs text-neutral-400">견적 요청 내역이 없습니다.</li>
          )}
        </ul>

        <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          전체 견적 요청
        </h2>
        <div className="space-y-2">
          {estimates.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {e.company.name} · {e.user.name}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {e.status === "REQUESTED" ? "답변 대기" : "답변 완료"}
                </span>
              </div>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">{e.request}</p>
            </div>
          ))}
          {estimates.length === 0 && (
            <p className="text-sm text-neutral-500">견적 요청 내역이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
