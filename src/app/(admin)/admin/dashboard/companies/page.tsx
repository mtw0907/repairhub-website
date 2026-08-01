import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { AdminCompanyRow } from "@/components/admin/AdminCompanyRow";

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string }>;
}) {
  const { keyword } = await searchParams;

  const companies = await prisma.company.findMany({
    where: keyword
      ? { OR: [{ name: { contains: keyword } }, { region: { contains: keyword } }] }
      : undefined,
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
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            업체 관리
          </h1>
          <Link
            href="/admin/dashboard/companies/new"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            + 업체 직접 등록
          </Link>
        </div>
        <form className="mb-6">
          <input
            type="text"
            name="keyword"
            defaultValue={keyword}
            placeholder="업체명 또는 지역으로 검색"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </form>
        <div className="space-y-2">
          {companies.map((c) => (
            <AdminCompanyRow
              key={c.id}
              company={{
                id: c.id,
                name: c.name,
                region: c.region,
                status: c.status,
                isPremium: c.isPremium,
                isFeatured: c.isFeatured,
              }}
            />
          ))}
          {companies.length === 0 && (
            <p className="text-sm text-neutral-500">검색 결과가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
