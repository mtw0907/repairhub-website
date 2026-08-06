import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AdminUserRow } from "@/components/admin/AdminUserRow";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string }>;
}) {
  const { keyword } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["USER", "PARTNER"] },
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { email: { contains: keyword } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          회원 관리
        </h1>
        <form className="mb-6">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <input
              type="text"
              name="keyword"
              defaultValue={keyword}
              placeholder="이름 또는 이메일로 검색"
              className="w-full min-w-0 border-0 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </form>
        <div className="space-y-2.5">
          {users.map((u) => (
            <AdminUserRow
              key={u.id}
              user={{
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                role: u.role,
                status: u.status,
              }}
            />
          ))}
          {users.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
