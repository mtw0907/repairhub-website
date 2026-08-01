import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

const VALID_TARGET_TYPES = ["USER", "COMPANY", "REVIEW", "PHOTO"];

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { targetType, targetId, reason, reviewId } = await req.json();

    if (!VALID_TARGET_TYPES.includes(targetType) || !targetId || !reason) {
      return NextResponse.json(
        { error: "targetType, targetId, reason이 필요합니다." },
        { status: 400 },
      );
    }

    const report = await prisma.report.create({
      data: {
        targetType,
        targetId,
        reason,
        reviewId: targetType === "REVIEW" ? (reviewId ?? targetId) : undefined,
        reporterId: user.id,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
