import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
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
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            업체 관리
          </h1>
          <Link
            href="/admin/dashboard/companies/new"
            className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            업체 직접 등록
          </Link>
        </div>
        <form className="mb-6">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <Search className="h-4 w-4 shrink-0 text-neutral-400" />
            <input
              type="text"
              name="keyword"
              defaultValue={keyword}
              placeholder="업체명 또는 지역으로 검색"
              className="w-full min-w-0 border-0 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </form>
        <div className="space-y-2.5">
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
                certificateUrl: c.certificateUrl,
                aiVerificationResult: c.aiVerificationResult,
              }}
            />
          ))}
          {companies.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
