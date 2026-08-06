import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";
import { notify } from "@/lib/notify";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { id } = await params;

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry || inquiry.companyId !== user.companyId) {
      throw new ForbiddenError();
    }

    const { answer } = await req.json();
    if (!answer) {
      return NextResponse.json({ error: "answer가 필요합니다." }, { status: 400 });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { answer, status: "ANSWERED" },
    });

    await notify(inquiry.userId, {
      type: "INQUIRY_ANSWERED",
      title: "문의에 답변이 도착했습니다",
      link: `/companies/${inquiry.companyId}`,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
