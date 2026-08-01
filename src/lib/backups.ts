import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export const BACKUP_DIR = path.join(process.cwd(), "prisma", "backups");
export const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");

export async function listBackups() {
  let files: string[];
  try {
    files = await readdir(BACKUP_DIR);
  } catch {
    return [];
  }

  const dbFiles = files.filter((f) => f.endsWith(".db"));
  const withStats = await Promise.all(
    dbFiles.map(async (filename) => {
      const s = await stat(path.join(BACKUP_DIR, filename));
      return { filename, size: s.size, mtime: s.mtime.toISOString() };
    }),
  );

  return withStats.sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
}

// Only allow filenames that actually exist in the backup dir (prevents
// path traversal via a client-supplied filename).
export async function isValidBackupFilename(filename: string) {
  const backups = await listBackups();
  return backups.some((b) => b.filename === filename);
}
