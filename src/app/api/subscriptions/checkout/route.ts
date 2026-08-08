import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { PRO_PLAN_PRICE, getTossKeys, toPaymentErrorResponse } from "@/lib/payment";

const ORDER_NAME = "소리수리 Pro 구독 (월간)";

export async function POST() {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    // Throws PaymentNotConfiguredError before we create any pending row.
    const { clientKey } = await getTossKeys();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: PRO_PLAN_PRICE,
        orderName: ORDER_NAME,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      orderId: payment.id,
      amount: PRO_PLAN_PRICE,
      orderName: ORDER_NAME,
      clientKey,
    });
  } catch (error) {
    return toPaymentErrorResponse(error);
  }
}
