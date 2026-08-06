import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AdminAccountRow } from "@/components/super-admin/AdminAccountRow";
import { NewAdminForm } from "@/components/super-admin/NewAdminForm";

export default async function SuperAdminAccountsPage() {
  const session = await auth();
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/super-admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          관리자 계정 관리
        </h1>
        <div className="mb-8 space-y-2.5">
          {admins.map((a) => (
            <AdminAccountRow
              key={a.id}
              admin={{
                id: a.id,
                name: a.name,
                email: a.email,
                role: a.role,
                status: a.status,
                isSelf: a.id === session?.user.id,
              }}
            />
          ))}
        </div>
        <h2 className="mb-2.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          새 관리자 계정 생성
        </h2>
        <NewAdminForm />
      </main>
    </div>
  );
}
