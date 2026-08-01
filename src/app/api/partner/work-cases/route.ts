import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const { title, content, photos, seoMeta } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "title과 content가 필요합니다." }, { status: 400 });
    }

    const workCase = await prisma.workCase.create({
      data: {
        companyId: user.companyId,
        title,
        content,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : null,
        seoMeta: seoMeta || null,
      },
    });

    return NextResponse.json(workCase, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
