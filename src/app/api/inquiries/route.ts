import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { companyId, message } = await req.json();
    if (!companyId || !message) {
      return NextResponse.json(
        { error: "companyId와 message가 필요합니다." },
        { status: 400 },
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: { userId: user.id, companyId, message, status: "OPEN" },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
