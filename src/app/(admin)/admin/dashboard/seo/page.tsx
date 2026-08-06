import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { SeoPageGenerator } from "@/components/admin/SeoPageGenerator";
import { SeoPageRow } from "@/components/admin/SeoPageRow";

export default async function AdminSeoPage() {
  const pages = await prisma.seoPage.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          AI SEO 페이지 생성
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          지역/브랜드/증상 키워드별로 검색엔진에 노출될 소개 페이지를 생성합니다. 해당 페이지는
          실제 등록된 업체 목록과 함께 공개적으로 노출됩니다.
        </p>
        <SeoPageGenerator />

        <h2 className="mb-2.5 mt-8 text-sm font-bold text-neutral-900 dark:text-neutral-100">
          생성된 페이지 ({pages.length})
        </h2>
        <div className="space-y-2.5">
          {pages.map((p) => (
            <SeoPageRow
              key={p.id}
              page={{ id: p.id, type: p.type, keyword: p.keyword, title: p.title }}
            />
          ))}
          {pages.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              생성된 페이지가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
