import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { BACKUP_DIR, isValidBackupFilename } from "@/lib/backups";

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    await requireRole(["SUPER_ADMIN"]);
    const { filename } = await params;

    if (!(await isValidBackupFilename(filename))) {
      return NextResponse.json({ error: "존재하지 않는 백업 파일입니다." }, { status: 404 });
    }

    const buffer = await readFile(path.join(BACKUP_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
