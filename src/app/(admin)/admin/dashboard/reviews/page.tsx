import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { AdminReviewRow } from "@/components/admin/AdminReviewRow";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: { not: "DELETED" } },
    include: { user: { select: { name: true } }, company: { select: { name: true } } },
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
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          후기 관리
        </h1>
        <div className="space-y-2">
          {reviews.map((r) => (
            <AdminReviewRow
              key={r.id}
              review={{
                id: r.id,
                userName: r.user.name,
                companyName: r.company.name,
                rating: r.rating,
                content: r.content,
                status: r.status,
              }}
            />
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-neutral-500">등록된 후기가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
