import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { companyId, request: requestText } = await req.json();
    if (!companyId || !requestText) {
      return NextResponse.json(
        { error: "companyId와 요청 내용이 필요합니다." },
        { status: 400 },
      );
    }

    const estimate = await prisma.estimate.create({
      data: {
        userId: user.id,
        companyId,
        request: requestText,
        status: "REQUESTED",
      },
    });

    return NextResponse.json(estimate, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
