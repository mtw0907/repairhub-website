import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { confirmTossPayment, toPaymentErrorResponse } from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const { paymentKey, orderId, amount } = await req.json();
    if (!paymentKey || !orderId || typeof amount !== "number") {
      return NextResponse.json(
        { error: "paymentKey, orderId, amount가 필요합니다." },
        { status: 400 },
      );
    }

    const payment = await prisma.payment.findUnique({ where: { id: orderId } });
    if (!payment || payment.userId !== user.id) {
      throw new ForbiddenError();
    }
    if (payment.status !== "PENDING") {
      return NextResponse.json({ error: "이미 처리된 결제입니다." }, { status: 409 });
    }
    // Never trust the client-supplied amount for business logic — compare
    // against what we ourselves recorded when the checkout was created.
    if (payment.amount !== amount) {
      return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
    }

    await confirmTossPayment({ paymentKey, orderId, amount });

    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        companyId: user.companyId,
        plan: "PRO",
        status: "ACTIVE",
        endsAt,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paymentKey, subscriptionId: subscription.id },
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
