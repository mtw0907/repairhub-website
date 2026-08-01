import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { logAdminActivity } from "@/lib/adminLog";

export async function POST(req: Request) {
  try {
    const actor = await requireRole(["SUPER_ADMIN"]);
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "name, email, password, role(ADMIN|SUPER_ADMIN)이 필요합니다." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    await logAdminActivity(actor.id, "ADMIN_CREATE", `${admin.email} (${role})`);

    return NextResponse.json(
      { id: admin.id, email: admin.email, role: admin.role },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
