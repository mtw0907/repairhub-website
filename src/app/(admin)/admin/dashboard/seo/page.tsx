import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { SeoPageGenerator } from "@/components/admin/SeoPageGenerator";
import { SeoPageRow } from "@/components/admin/SeoPageRow";

export default async function AdminSeoPage() {
  const pages = await prisma.seoPage.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/admin/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          AI SEO 페이지 생성
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          지역/브랜드/증상 키워드별로 검색엔진에 노출될 소개 페이지를 생성합니다. 해당 페이지는
          실제 등록된 업체 목록과 함께 공개적으로 노출됩니다.
        </p>
        <SeoPageGenerator />

        <h2 className="mb-2 mt-8 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          생성된 페이지 ({pages.length})
        </h2>
        <div className="space-y-2">
          {pages.map((p) => (
            <SeoPageRow
              key={p.id}
              page={{ id: p.id, type: p.type, keyword: p.keyword, title: p.title }}
            />
          ))}
          {pages.length === 0 && (
            <p className="text-sm text-neutral-500">생성된 페이지가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
