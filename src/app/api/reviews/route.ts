import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { companyId, rating, content, photos } = await req.json();

    if (!companyId || !content || typeof rating !== "number") {
      return NextResponse.json(
        { error: "companyId, rating, content가 필요합니다." },
        { status: 400 },
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "평점은 1~5 사이여야 합니다." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        companyId,
        rating,
        content,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : null,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
