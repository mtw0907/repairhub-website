import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AiAnalysisCard, type AiAnalysisResult } from "@/components/repair/AiAnalysisCard";
import { PartnerQuoteForm } from "@/components/repair/PartnerQuoteForm";

export default async function PartnerRepairRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const companyId = session!.user.companyId!;

  const repairRequest = await prisma.repairRequest.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      quotes: { where: { companyId } },
    },
  });

  const matchedCompanyIds: string[] = repairRequest?.matchedCompanyIds
    ? JSON.parse(repairRequest.matchedCompanyIds)
    : [];

  if (!repairRequest || !matchedCompanyIds.includes(companyId)) {
    notFound();
  }

  const aiResult: AiAnalysisResult | null = repairRequest.aiResult
    ? JSON.parse(repairRequest.aiResult)
    : null;
  const photos: string[] = repairRequest.photos ? JSON.parse(repairRequest.photos) : [];
  const videos: string[] = repairRequest.videos ? JSON.parse(repairRequest.videos) : [];
  const existingQuote = repairRequest.quotes[0];

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard/repair-requests" backLabel="견적 요청 목록으로" />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            {repairRequest.instrument} 수리 요청
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{repairRequest.user.name}님의 요청</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 font-medium text-neutral-500">종류</dt>
              <dd className="text-neutral-800 dark:text-neutral-200">{repairRequest.instrument}</dd>
            </div>
            {repairRequest.brand && (
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 font-medium text-neutral-500">브랜드</dt>
                <dd className="text-neutral-800 dark:text-neutral-200">{repairRequest.brand}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 font-medium text-neutral-500">증상</dt>
              <dd className="whitespace-pre-line text-neutral-800 dark:text-neutral-200">{repairRequest.symptom}</dd>
            </div>
          </dl>

          {photos.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {photos.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="증상 사진" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              ))}
            </div>
          )}
          {videos.length > 0 && (
            <div className="mt-3 space-y-2">
              {videos.map((url) => (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video key={url} src={url} controls className="w-full rounded-lg" />
              ))}
            </div>
          )}
        </div>

        {aiResult && <AiAnalysisCard result={aiResult} />}

        <PartnerQuoteForm
          repairRequestId={repairRequest.id}
          existingQuote={
            existingQuote
              ? {
                  price: existingQuote.price,
                  duration: existingQuote.duration,
                  availableDate: existingQuote.availableDate
                    ? existingQuote.availableDate.toISOString()
                    : null,
                  onSiteAvailable: existingQuote.onSiteAvailable,
                  message: existingQuote.message,
                }
              : undefined
          }
        />
      </main>
    </div>
  );
}
