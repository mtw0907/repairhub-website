import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { SimpleCrudManager } from "@/components/admin/SimpleCrudManager";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard/content" backLabel="콘텐츠 관리로" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
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
