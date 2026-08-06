import { StaffPageHeader } from "@/components/StaffPageHeader";
import { BackupManager } from "@/components/super-admin/BackupManager";
import { listBackups } from "@/lib/backups";

export default async function SuperAdminBackupPage() {
  const backups = await listBackups();

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/super-admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
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
