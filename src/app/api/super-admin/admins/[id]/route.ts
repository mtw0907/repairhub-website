import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { logAdminActivity } from "@/lib/adminLog";
import { notifyRole } from "@/lib/notify";

async function countActiveSuperAdmins() {
  return prisma.user.count({ where: { role: "SUPER_ADMIN", status: "ACTIVE" } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole(["SUPER_ADMIN"]);
    const { id } = await params;

    if (id === actor.id) {
      return NextResponse.json(
        { error: "자기 자신의 권한/상태는 변경할 수 없습니다." },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || (target.role !== "ADMIN" && target.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "관리자 계정을 찾을 수 없습니다." }, { status: 404 });
    }

    const { role, status } = await req.json();

    const wouldRemoveLastSuperAdmin =
      target.role === "SUPER_ADMIN" &&
      ((role && role !== "SUPER_ADMIN") || (status && status !== "ACTIVE"));

    if (wouldRemoveLastSuperAdmin && (await countActiveSuperAdmins()) <= 1) {
      return NextResponse.json(
        { error: "마지막 남은 최고관리자는 권한을 변경하거나 정지할 수 없습니다." },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined ? { role } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (role !== undefined && role !== target.role) {
      await logAdminActivity(actor.id, "ROLE_CHANGE", `${target.email}: ${target.role} -> ${role}`);
      await notifyRole(
        "SUPER_ADMIN",
        {
          type: "ADMIN_ACCOUNT_CHANGED",
          title: `${target.email} 역할 변경: ${target.role} → ${role}`,
          link: "/super-admin/dashboard/admins",
        },
        actor.id,
      );
    }
    if (status !== undefined && status !== target.status) {
      await logAdminActivity(actor.id, "ADMIN_STATUS_CHANGE", `${target.email}: ${status}`);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireRole(["SUPER_ADMIN"]);
    const { id } = await params;

    if (id === actor.id) {
      return NextResponse.json({ error: "자기 자신은 삭제할 수 없습니다." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || (target.role !== "ADMIN" && target.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "관리자 계정을 찾을 수 없습니다." }, { status: 404 });
    }

    if (target.role === "SUPER_ADMIN" && (await countActiveSuperAdmins()) <= 1) {
      return NextResponse.json(
        { error: "마지막 남은 최고관리자는 삭제할 수 없습니다." },
        { status: 400 },
      );
    }

    await prisma.user.update({ where: { id }, data: { status: "DELETED" } });
    await logAdminActivity(actor.id, "ADMIN_DELETE", target.email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
