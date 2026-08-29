import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";
import { AiAnalysisCard, type AiAnalysisResult } from "@/components/repair/AiAnalysisCard";
import { AnalyzedStep } from "@/components/repair/AnalyzedStep";
import { QuoteCompareList, type QuoteSummary } from "@/components/repair/QuoteCompareList";

export default async function RepairRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id },
    include: {
      quotes: {
        where: { status: "PENDING" },
        include: {
          company: {
            include: {
              services: true,
              reviews: { where: { status: "VISIBLE" }, select: { rating: true } },
            },
          },
        },
      },
    },
  });

  if (!repairRequest || repairRequest.userId !== session?.user?.id) {
    notFound();
  }

  const aiResult: AiAnalysisResult | null = repairRequest.aiResult
    ? JSON.parse(repairRequest.aiResult)
    : null;

  const quotes: QuoteSummary[] = repairRequest.quotes.map((q) => {
    const reviewCount = q.company.reviews.length;
    const avgRating =
      reviewCount > 0 ? q.company.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;
    return {
      id: q.id,
      price: q.price,
      duration: q.duration,
      availableDate: q.availableDate ? q.availableDate.toISOString() : null,
      onSiteAvailable: q.onSiteAvailable,
      message: q.message,
      company: {
        id: q.company.id,
        name: q.company.name,
        avgRating,
        reviewCount,
        services: q.company.services.map((s) => s.name),
      },
    };
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            {repairRequest.instrument} 수리 요청
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {[repairRequest.brand, repairRequest.model].filter(Boolean).join(" ")}
            {(repairRequest.brand || repairRequest.model) && " · "}
            {repairRequest.symptom}
          </p>
        </div>

        {repairRequest.status === "RESERVED" ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              예약이 완료되었습니다!
            </p>
            <Link
              href="/dashboard/reservations"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
            >
              내 예약 내역 보기
            </Link>
          </div>
        ) : (
          <>
            {aiResult && <AiAnalysisCard result={aiResult} />}

            {repairRequest.status === "ANALYZED" && (
              <AnalyzedStep repairRequestId={repairRequest.id} />
            )}

            {(repairRequest.status === "MATCHING" || repairRequest.status === "QUOTED") && (
              <div>
                <h2 className="mb-3 text-base font-bold text-neutral-900 dark:text-neutral-100">
                  받은 견적 비교
                </h2>
                <QuoteCompareList quotes={quotes} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
