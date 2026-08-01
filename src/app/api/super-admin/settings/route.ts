import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { logAdminActivity } from "@/lib/adminLog";
import { isSensitiveKey } from "@/lib/systemSettings";

export async function PATCH(req: Request) {
  try {
    const actor = await requireRole(["SUPER_ADMIN"]);
    const { key, value } = await req.json();

    if (!key || typeof value !== "string") {
      return NextResponse.json({ error: "key와 value가 필요합니다." }, { status: 400 });
    }

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await logAdminActivity(
      actor.id,
      "SETTINGS_UPDATE",
      isSensitiveKey(key) ? `${key} 값 변경 (내용 비공개)` : `${key} = ${value}`,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
