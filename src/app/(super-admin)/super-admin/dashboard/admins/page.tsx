import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { AdminAccountRow } from "@/components/super-admin/AdminAccountRow";
import { NewAdminForm } from "@/components/super-admin/NewAdminForm";

export default async function SuperAdminAccountsPage() {
  const session = await auth();
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/super-admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          관리자 계정 관리
        </h1>
        <div className="mb-6 space-y-2">
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
        <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          새 관리자 계정 생성
        </h2>
        <NewAdminForm />
      </main>
    </div>
  );
}
