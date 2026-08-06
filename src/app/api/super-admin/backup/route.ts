import { NextResponse } from "next/server";
import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { logAdminActivity } from "@/lib/adminLog";
import { BACKUP_DIR, DB_PATH } from "@/lib/backups";
import { notifyRole } from "@/lib/notify";

export async function POST() {
  try {
    const actor = await requireRole(["SUPER_ADMIN"]);

    await mkdir(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.db`;
    await copyFile(DB_PATH, path.join(BACKUP_DIR, filename));

    await logAdminActivity(actor.id, "DB_BACKUP", filename);
    await notifyRole(
      "SUPER_ADMIN",
      { type: "DB_BACKUP_EVENT", title: `DB 백업 실행됨: ${filename}`, link: "/super-admin/dashboard/backup" },
      actor.id,
    );

    return NextResponse.json({ filename }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
