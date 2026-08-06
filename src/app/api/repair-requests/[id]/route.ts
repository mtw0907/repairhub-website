import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireSession();
    const { id } = await params;

    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id },
      include: {
        quotes: {
          include: { company: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!repairRequest) {
      return NextResponse.json({ error: "요청을 찾을 수 없습니다." }, { status: 404 });
    }

    const matchedCompanyIds: string[] = repairRequest.matchedCompanyIds
      ? JSON.parse(repairRequest.matchedCompanyIds)
      : [];

    const isOwner = user.role === "USER" && repairRequest.userId === user.id;
    const isMatchedPartner =
      user.role === "PARTNER" && !!user.companyId && matchedCompanyIds.includes(user.companyId);
    const isStaff = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isOwner && !isMatchedPartner && !isStaff) {
      throw new ForbiddenError();
    }

    return NextResponse.json(repairRequest);
  } catch (error) {
    return toErrorResponse(error);
  }
}
