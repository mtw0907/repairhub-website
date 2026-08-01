import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"]);
    const { imageUrl, linkUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl이 필요합니다." }, { status: 400 });
    }
    const banner = await prisma.banner.create({ data: { imageUrl, linkUrl: linkUrl || null } });
    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
