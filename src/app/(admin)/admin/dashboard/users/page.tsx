import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
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
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          회원 관리
        </h1>
        <form className="mb-6">
          <input
            type="text"
            name="keyword"
            defaultValue={keyword}
            placeholder="이름 또는 이메일로 검색"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </form>
        <div className="space-y-2">
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
            <p className="text-sm text-neutral-500">검색 결과가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
