import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "name이 필요합니다." }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: { companyId: user.companyId, name },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
