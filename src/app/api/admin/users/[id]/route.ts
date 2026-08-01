import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { USER_STATUSES } from "@/lib/constants";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Role changes are reserved for SUPER_ADMIN ("권한 관리"); ADMIN can only
    // edit profile fields and active/suspended status here.
    await requireRole(["ADMIN"]);
    const { id } = await params;

    const { name, phone, status } = await req.json();
    if (status !== undefined && !USER_STATUSES.includes(status)) {
      return NextResponse.json({ error: "올바르지 않은 상태값입니다." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;

    // Soft delete: preserves FK-referenced history (reservations, reviews, etc.)
    const updated = await prisma.user.update({
      where: { id },
      data: { status: "DELETED" },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
