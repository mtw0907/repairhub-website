import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
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
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/partner/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          고객 문의 관리
        </h1>
        <div className="space-y-4">
          {inquiries.map((i) => (
            <div
              key={i.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {i.user.name}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
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
            <p className="text-sm text-neutral-500">아직 고객 문의가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
