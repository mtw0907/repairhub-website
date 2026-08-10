import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { PRO_PLAN_PRICE, issueBillingKey, chargeBilling, toPaymentErrorResponse } from "@/lib/payment";

const ORDER_NAME = "소리수리 Pro 구독 (월간)";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const { authKey, customerKey } = await req.json();
    if (!authKey || customerKey !== `billing_${user.companyId}`) {
      return NextResponse.json({ error: "카드 등록 정보가 올바르지 않습니다." }, { status: 400 });
    }

    const { billingKey } = await issueBillingKey({ authKey, customerKey });

    await prisma.company.update({
      where: { id: user.companyId },
      data: { billingKey, billingCustomerKey: customerKey, autoRenew: true },
    });

    const payment = await prisma.payment.create({
      data: { userId: user.id, amount: PRO_PLAN_PRICE, orderName: ORDER_NAME, status: "PENDING" },
    });

    const charge = await chargeBilling({
      billingKey,
      customerKey,
      amount: PRO_PLAN_PRICE,
      orderId: payment.id,
      orderName: ORDER_NAME,
    });

    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: { companyId: user.companyId, plan: "PRO", status: "ACTIVE", endsAt },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paymentKey: charge.paymentKey, subscriptionId: subscription.id },
    });

    await prisma.company.update({
      where: { id: user.companyId },
      data: { isPremium: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toPaymentErrorResponse(error);
  }
}
