import { NextResponse } from "next/server";
import { getSetting } from "@/lib/systemSettings";
import { toErrorResponse } from "@/lib/rbac";

export { PRO_PLAN_PRICE } from "@/lib/constants";

export class PaymentNotConfiguredError extends Error {
  constructor() {
    super("결제 기능을 사용하려면 최고관리자가 시스템 설정에서 토스페이먼츠 키를 등록해야 합니다.");
    this.name = "PaymentNotConfiguredError";
  }
}

export class TossApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TossApiError";
  }
}

export async function getTossKeys(): Promise<{ clientKey: string; secretKey: string }> {
  const clientKey = (await getSetting("PAYMENT_CLIENT_KEY")) || process.env.PAYMENT_CLIENT_KEY;
  const secretKey = (await getSetting("PAYMENT_SECRET_KEY")) || process.env.PAYMENT_SECRET_KEY;
  if (!clientKey || !secretKey) throw new PaymentNotConfiguredError();
  return { clientKey, secretKey };
}

function authHeader(secretKey: string) {
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

export async function confirmTossPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  const { secretKey } = await getTossKeys();

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: authHeader(secretKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new TossApiError(data?.message ?? "결제 승인에 실패했습니다.", res.status);
  }
  return data;
}

export async function cancelTossPayment(params: { paymentKey: string; cancelReason: string }) {
  const { secretKey } = await getTossKeys();

  const res = await fetch(
    `https://api.tosspayments.com/v1/payments/${params.paymentKey}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader(secretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancelReason: params.cancelReason }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new TossApiError(data?.message ?? "결제 취소에 실패했습니다.", res.status);
  }
  return data;
}

export function toPaymentErrorResponse(error: unknown): NextResponse {
  if (error instanceof PaymentNotConfiguredError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  if (error instanceof TossApiError) {
    return NextResponse.json(
      { error: `결제 처리 중 오류가 발생했습니다: ${error.message}` },
      { status: 502 },
    );
  }
  return toErrorResponse(error);
}
