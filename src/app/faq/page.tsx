import type { Metadata } from "next";
import { HelpCircle, Mail } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "고객센터 · 자주 묻는 질문 | 소리수리",
  description: "소리수리 이용 중 궁금한 점을 확인해보세요.",
};

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100 sm:text-3xl">
          <HelpCircle className="h-7 w-7 text-accent" />
          고객센터
        </h1>
        <p className="mb-6 text-sm text-neutral-500">자주 묻는 질문을 먼저 확인해보시고, 원하는 답을 못 찾으셨다면 아래로 문의해주세요.</p>

        {faqs.length > 0 ? (
          <div className="space-y-3">
            {faqs.map((f) => (
              <Card key={f.id} className="p-4">
                <p className="mb-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">Q. {f.question}</p>
                <p className="whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">A. {f.answer}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={HelpCircle} title="등록된 자주 묻는 질문이 아직 없어요." />
        )}

        <Card className="mt-8 flex items-center gap-3 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">더 궁금한 점이 있으신가요?</p>
            <p className="text-xs text-neutral-500">업체별 문의는 각 업체 상세 페이지의 "문의하기" 탭을 이용해주세요.</p>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
