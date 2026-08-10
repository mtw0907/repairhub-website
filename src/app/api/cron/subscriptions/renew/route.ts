import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRO_PLAN_PRICE, chargeBilling, TossApiError } from "@/lib/payment";
import { notifyCompanyOwners } from "@/lib/notify";

const ORDER_NAME = "소리수리 Pro 구독 (월간)";

// Vercel Cron이 매일 호출해 만료된 구독을 자동 재청구. vercel.json 참고.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dueSubscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE", endsAt: { lte: new Date() } },
    include: { company: { include: { owners: true } } },
  });

  let renewed = 0;
  let expired = 0;
  let failed = 0;

  for (const sub of dueSubscriptions) {
    const company = sub.company;
    const ownerId = company.owners[0]?.id;

    if (!company.autoRenew || !company.billingKey || !ownerId) {
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: "EXPIRED" } });
      await prisma.company.update({ where: { id: company.id }, data: { isPremium: false } });
      expired++;
      continue;
    }

    const payment = await prisma.payment.create({
      data: {
        userId: ownerId,
        subscriptionId: sub.id,
        amount: PRO_PLAN_PRICE,
        orderName: ORDER_NAME,
        status: "PENDING",
      },
    });

    try {
      const charge = await chargeBilling({
        billingKey: company.billingKey,
        customerKey: company.billingCustomerKey!,
        amount: PRO_PLAN_PRICE,
        orderId: payment.id,
        orderName: ORDER_NAME,
      });

      const newEndsAt = new Date(sub.endsAt!);
      newEndsAt.setMonth(newEndsAt.getMonth() + 1);

      await prisma.subscription.update({ where: { id: sub.id }, data: { endsAt: newEndsAt } });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paymentKey: charge.paymentKey },
      });
      renewed++;
    } catch (error) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: "EXPIRED" } });
      await prisma.company.update({ where: { id: company.id }, data: { isPremium: false } });
      await notifyCompanyOwners(company.id, {
        type: "SUBSCRIPTION_RENEWAL_FAILED",
        title: "정기결제에 실패했습니다",
        body:
          error instanceof TossApiError
            ? error.message
            : "카드 결제에 실패해 Pro 구독이 해지되었습니다. 구독 관리 페이지에서 다시 시작할 수 있습니다.",
        link: "/partner/dashboard/subscription",
      });
      failed++;
    }
  }

  return NextResponse.json({ checked: dueSubscriptions.length, renewed, expired, failed });
}
