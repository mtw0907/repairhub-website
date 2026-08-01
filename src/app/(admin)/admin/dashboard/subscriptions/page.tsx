import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { AdminPaymentRow } from "@/components/admin/AdminPaymentRow";

export default async function AdminSubscriptionsPage() {
  const [subscriptions, payments] = await Promise.all([
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { company: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.payment.findMany({
      include: {
        user: { select: { name: true } },
        subscription: { include: { company: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

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
          구독 · 결제 관리
        </h1>

        <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Pro 구독 중인 업체 ({subscriptions.length})
        </h2>
        <ul className="mb-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200 text-sm dark:divide-neutral-800 dark:border-neutral-800">
          {subscriptions.map((s) => (
            <li key={s.id} className="flex justify-between px-4 py-2">
              <span>{s.company.name}</span>
              <span className="text-xs text-neutral-500">
                {s.endsAt ? `다음 결제일: ${new Date(s.endsAt).toLocaleDateString("ko-KR")}` : ""}
              </span>
            </li>
          ))}
          {subscriptions.length === 0 && (
            <li className="px-4 py-3 text-xs text-neutral-400">Pro 구독 중인 업체가 없습니다.</li>
          )}
        </ul>

        <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          결제 내역
        </h2>
        <div className="space-y-2">
          {payments.map((p) => (
            <AdminPaymentRow
              key={p.id}
              payment={{
                id: p.id,
                userName: p.user.name,
                companyName: p.subscription?.company.name ?? null,
                amount: p.amount,
                status: p.status,
                orderName: p.orderName,
                createdAt: p.createdAt.toISOString(),
              }}
            />
          ))}
          {payments.length === 0 && (
            <p className="text-sm text-neutral-500">결제 내역이 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
