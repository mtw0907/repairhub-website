import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
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
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          구독 · 결제 관리
        </h1>

        <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Pro 구독 중인 업체 ({subscriptions.length})
        </h2>
        <ul className="mb-8 divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white text-sm shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {subscriptions.map((s) => (
            <li key={s.id} className="flex justify-between px-4 py-2.5">
              <span className="font-medium">{s.company.name}</span>
              <span className="text-xs text-neutral-500">
                {s.endsAt ? `다음 결제일: ${new Date(s.endsAt).toLocaleDateString("ko-KR")}` : ""}
              </span>
            </li>
          ))}
          {subscriptions.length === 0 && (
            <li className="px-4 py-3 text-xs text-neutral-400">Pro 구독 중인 업체가 없습니다.</li>
          )}
        </ul>

        <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          결제 내역
        </h2>
        <div className="space-y-2.5">
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
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              결제 내역이 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
