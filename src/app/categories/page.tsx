import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCategoryTree } from "@/lib/categories";
import { CategoryBrowser } from "@/components/home/CategoryBrowser";

export const metadata: Metadata = {
  title: "전체 카테고리 | 소리수리",
  description: "악기, 음향기기부터 드론, 사진장비, 3D프린터까지 — 수리 대상 카테고리를 모두 둘러보세요.",
};

export default async function CategoriesPage() {
  const categoryTree = await getCategoryTree();

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100 sm:text-3xl">
          전체 카테고리
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          대분류를 눌러 세부 품목을 확인하고, 원하는 품목을 선택하면 해당 업체를 바로 찾아볼 수 있어요.
        </p>
        <CategoryBrowser tree={categoryTree} />
      </main>
      <SiteFooter />
    </div>
  );
}
