import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { id } = await params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.companyId !== user.companyId) {
      throw new ForbiddenError();
    }

    const { partnerReply } = await req.json();
    if (!partnerReply) {
      return NextResponse.json({ error: "partnerReply가 필요합니다." }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { partnerReply },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
