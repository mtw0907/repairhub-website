import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { ReviewReplyForm } from "@/components/partner/ReviewReplyForm";

export default async function PartnerReviewsPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const reviews = await prisma.review.findMany({
    where: { companyId, status: "VISIBLE" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/partner/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          후기 관리
        </h1>
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {r.user.name}
                </span>
                <span className="text-amber-500">{"★".repeat(r.rating)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                {r.content}
              </p>
              <ReviewReplyForm
                reviewId={r.id}
                reviewContent={r.content}
                rating={r.rating}
                existingReply={r.partnerReply}
              />
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-neutral-500">아직 등록된 후기가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
