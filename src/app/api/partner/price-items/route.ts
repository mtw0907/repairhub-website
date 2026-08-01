import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const { label, price } = await req.json();
    if (!label || typeof price !== "number") {
      return NextResponse.json({ error: "label과 price가 필요합니다." }, { status: 400 });
    }

    const priceItem = await prisma.priceItem.create({
      data: { companyId: user.companyId, label, price },
    });
    return NextResponse.json(priceItem, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
