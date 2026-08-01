import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { cancelTossPayment, toPaymentErrorResponse } from "@/lib/payment";
import { logAdminActivity } from "@/lib/adminLog";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const { id } = await params;
    const { reason } = await req.json().catch(() => ({ reason: undefined }));

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ error: "결제 내역을 찾을 수 없습니다." }, { status: 404 });
    }
    if (payment.status !== "PAID" || !payment.paymentKey) {
      return NextResponse.json(
        { error: "환불 가능한 결제 상태가 아닙니다." },
        { status: 409 },
      );
    }

    await cancelTossPayment({
      paymentKey: payment.paymentKey,
      cancelReason: reason || "관리자 환불 처리",
    });

    await prisma.payment.update({ where: { id }, data: { status: "REFUNDED" } });

    if (payment.subscriptionId) {
      const subscription = await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "CANCELED", endsAt: new Date() },
      });
      await prisma.company.update({
        where: { id: subscription.companyId },
        data: { isPremium: false },
      });
    }

    await logAdminActivity(admin.id, "PAYMENT_REFUND", `payment ${id}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toPaymentErrorResponse(error);
  }
}
