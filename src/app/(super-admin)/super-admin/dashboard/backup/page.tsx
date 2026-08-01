import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { BackupManager } from "@/components/super-admin/BackupManager";
import { listBackups } from "@/lib/backups";

export default async function SuperAdminBackupPage() {
  const backups = await listBackups();

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/super-admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          DB 백업 · 복원
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          SQLite 데이터베이스 파일을 그대로 백업/복원합니다. 복원은 되돌릴 수 없으니 신중하게
          진행해주세요.
        </p>
        <BackupManager backups={backups} />
      </main>
    </div>
  );
}
