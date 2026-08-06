import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession, toErrorResponse } from "@/lib/rbac";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(req: Request) {
  try {
    const user = await requireSession();
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { name, phone, currentPassword, newPassword } = parsed.data;

    const data: { name?: string; phone?: string; password?: string } = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;

    if (newPassword) {
      const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

      // OAuth-only accounts have no password yet — let them set an initial
      // one without proving a "current" password that never existed.
      if (dbUser.password) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: "현재 비밀번호를 입력해주세요." },
            { status: 400 },
          );
        }
        const valid = await bcrypt.compare(currentPassword, dbUser.password);
        if (!valid) {
          return NextResponse.json(
            { error: "현재 비밀번호가 올바르지 않습니다." },
            { status: 400 },
          );
        }
      }
      data.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, name: true, phone: true, email: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

// Soft-delete: keep the row (reservations/reviews/payments reference it)
// but scrub personal data and free up the email so it can be re-registered.
// Restricted to USER — PARTNER/ADMIN accounts have side effects (owned
// company, admin duties) that self-service withdrawal doesn't handle.
export async function DELETE(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const body = await req.json().catch(() => ({}));
    const { password } = body as { password?: string };

    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

    if (dbUser.password) {
      if (!password || !(await bcrypt.compare(password, dbUser.password))) {
        return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "DELETED",
        password: null,
        name: "탈퇴한 회원",
        phone: null,
        email: `deleted-${user.id}@withdrawn.repairhub.local`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
