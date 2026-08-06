import { NextResponse } from "next/server";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { logAdminActivity } from "@/lib/adminLog";
import { BACKUP_DIR, DB_PATH, isValidBackupFilename } from "@/lib/backups";
import { notifyRole } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const actor = await requireRole(["SUPER_ADMIN"]);
    const { filename } = await req.json();

    if (!filename || !(await isValidBackupFilename(filename))) {
      return NextResponse.json({ error: "존재하지 않는 백업 파일입니다." }, { status: 400 });
    }

    // Release the live connection before swapping the file out from under it.
    await prisma.$disconnect();
    await copyFile(path.join(BACKUP_DIR, filename), DB_PATH);

    await logAdminActivity(actor.id, "DB_RESTORE", filename);
    await notifyRole(
      "SUPER_ADMIN",
      { type: "DB_BACKUP_EVENT", title: `DB 복원 실행됨: ${filename}`, link: "/super-admin/dashboard/backup" },
      actor.id,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
