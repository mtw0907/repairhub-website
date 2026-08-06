import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
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
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          후기 관리
        </h1>
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {r.user.name}
                </span>
                <span className="text-accent">{"★".repeat(r.rating)}</span>
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
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 등록된 후기가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
