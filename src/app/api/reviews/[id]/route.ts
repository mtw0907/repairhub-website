import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["USER"]);
    const { id } = await params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== user.id) {
      throw new ForbiddenError();
    }

    const { rating, content, photos } = await req.json();
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "평점은 1~5 사이여야 합니다." }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined ? { rating } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(photos !== undefined
          ? { photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : null }
          : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
