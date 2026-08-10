import { NextResponse } from "next/server";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { getTossKeys, toPaymentErrorResponse } from "@/lib/payment";

export async function POST() {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    // Throws PaymentNotConfiguredError before we send the client anywhere.
    const { clientKey } = await getTossKeys();

    return NextResponse.json({
      clientKey,
      customerKey: `billing_${user.companyId}`,
    });
  } catch (error) {
    return toPaymentErrorResponse(error);
  }
}
