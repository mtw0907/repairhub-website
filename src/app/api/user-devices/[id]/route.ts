import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["USER"]);
    const { id } = await params;

    const existing = await prisma.userDevice.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      throw new ForbiddenError();
    }

    const { name, categoryId, brand, model, photoUrl, memo } = await req.json();
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "장비 이름을 입력해주세요." }, { status: 400 });
    }

    const device = await prisma.userDevice.update({
      where: { id },
      data: {
        name: String(name).trim(),
        categoryId: categoryId || null,
        brand: brand || null,
        model: model || null,
        photoUrl: photoUrl || null,
        memo: memo || null,
      },
    });

    return NextResponse.json(device);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["USER"]);
    const { id } = await params;

    const existing = await prisma.userDevice.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      throw new ForbiddenError();
    }

    await prisma.userDevice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
