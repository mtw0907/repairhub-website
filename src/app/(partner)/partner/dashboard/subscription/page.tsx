import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { CancelSubscriptionButton } from "@/components/partner/CancelSubscriptionButton";
import { PRO_PLAN_PRICE } from "@/lib/constants";

export default async function PartnerSubscriptionPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const [company, subscriptions, payments] = await Promise.all([
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.subscription.findMany({ where: { companyId }, orderBy: { startedAt: "desc" } }),
    prisma.payment.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const activeSubscription = subscriptions.find((s) => s.status === "ACTIVE");

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          구독 관리
        </h1>

        <div className="mb-8 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          {activeSubscription ? (
            <>
              <p className="text-sm text-neutral-500">현재 플랜</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                RepairHub Pro
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  프리미엄
                </span>
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {activeSubscription.endsAt
                  ? `다음 결제일: ${new Date(activeSubscription.endsAt).toLocaleDateString("ko-KR")}`
                  : ""}
              </p>
              <div className="mt-4">
                <CancelSubscriptionButton />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-500">현재 플랜</p>
              <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                무료 플랜
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Pro 구독 시 프리미엄 노출과 추천 업체 우선 배치 혜택을 받을 수 있습니다. (월{" "}
                {PRO_PLAN_PRICE.toLocaleString()}원)
              </p>
              <Link
                href="/partner/dashboard/subscription/checkout"
                className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90"
              >
                Pro 구독 시작하기
              </Link>
            </>
          )}
        </div>

        <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          결제 내역
        </h2>
        <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200/70 bg-white text-sm shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-2.5">
              <span>
                {p.orderName ?? "결제"} ·{" "}
                {new Date(p.createdAt).toLocaleDateString("ko-KR")}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{p.amount.toLocaleString()}원</span>
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {p.status}
                </span>
              </span>
            </li>
          ))}
          {payments.length === 0 && (
            <li className="px-4 py-3 text-xs text-neutral-400">결제 내역이 없습니다.</li>
          )}
        </ul>

        {company.isPremium && !activeSubscription && (
          <p className="mt-4 text-xs text-neutral-400">
            현재 관리자에 의해 프리미엄으로 지정되어 있습니다 (별도 구독 없이 적용된 상태).
          </p>
        )}
      </main>
    </div>
  );
}
