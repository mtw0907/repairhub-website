import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { notifyCompanyOwners } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { companyId, message } = await req.json();
    if (!companyId || !message) {
      return NextResponse.json(
        { error: "companyId와 message가 필요합니다." },
        { status: 400 },
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: { userId: user.id, companyId, message, status: "OPEN" },
    });

    await notifyCompanyOwners(companyId, {
      type: "NEW_INQUIRY",
      title: "새 문의가 도착했습니다",
      link: "/partner/dashboard/inquiries",
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
