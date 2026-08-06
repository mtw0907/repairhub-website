import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
import { AnswerForm } from "@/components/partner/AnswerForm";
import { AiInlineAction } from "@/components/ai/AiInlineAction";

export default async function PartnerInquiriesPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const inquiries = await prisma.inquiry.findMany({
    where: { companyId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          고객 문의 관리
        </h1>
        <div className="space-y-3">
          {inquiries.map((i) => (
            <div
              key={i.id}
              className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {i.user.name}
                </span>
                <span
                  className={
                    i.status === "OPEN"
                      ? "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                  }
                >
                  {i.status === "OPEN" ? "답변 대기" : "답변 완료"}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
                {i.message}
              </p>
              <AnswerForm endpoint={`/api/partner/inquiries/${i.id}`} existingAnswer={i.answer} />
              <AiInlineAction
                endpoint="/api/ai/classify-inquiry"
                body={{ inquiryId: i.id }}
                buttonLabel="AI 문의 분류"
              />
            </div>
          ))}
          {inquiries.length === 0 && (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700">
              아직 고객 문의가 없습니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
