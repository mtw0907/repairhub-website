import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { SimpleCrudManager } from "@/components/admin/SimpleCrudManager";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/admin/dashboard/content" className="text-sm text-neutral-500 hover:underline">
          ← 콘텐츠 관리로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          배너 관리
        </h1>
        <SimpleCrudManager
          addEndpoint="/api/admin/banners"
          deleteEndpointBase="/api/admin/banners"
          items={banners.map((b) => ({
            id: b.id,
            imageUrl: b.imageUrl,
            linkUrl: b.linkUrl ?? "",
          }))}
          fields={[
            { key: "imageUrl", label: "이미지 URL" },
            { key: "linkUrl", label: "링크 URL (선택, 없으면 - 입력)" },
          ]}
        />
      </main>
    </div>
  );
}
