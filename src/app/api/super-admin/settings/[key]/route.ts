import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { logAdminActivity } from "@/lib/adminLog";

export async function DELETE(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const actor = await requireRole(["SUPER_ADMIN"]);
    const { key } = await params;

    await prisma.systemSetting.delete({ where: { key } }).catch(() => {});
    await logAdminActivity(actor.id, "SETTINGS_DELETE", key);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
