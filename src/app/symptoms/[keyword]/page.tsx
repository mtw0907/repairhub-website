import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { CompanyResults } from "@/components/company/CompanyResults";
import { getSeoLandingData } from "@/lib/seoLanding";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ keyword: string }>;
}): Promise<Metadata> {
  const { keyword } = await params;
  const data = await getSeoLandingData("SYMPTOM", decodeURIComponent(keyword));
  if (!data) return {};
  return { title: `${data.seoPage.title} | RepairHub`, description: data.seoPage.introText };
}

export default async function SymptomLandingPage({
  params,
}: {
  params: Promise<{ keyword: string }>;
}) {
  const { keyword } = await params;
  const data = await getSeoLandingData("SYMPTOM", decodeURIComponent(keyword));
  if (!data) notFound();

  const session = await auth();
  const isUser = session?.user?.role === "USER";
  const favorites = isUser
    ? await prisma.favorite.findMany({ where: { userId: session!.user.id }, select: { companyId: true } })
    : [];

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100 sm:text-3xl">
          {data.seoPage.title}
        </h1>
        <p className="mb-6 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">
          {data.seoPage.introText}
        </p>
        <p className="mb-4 text-sm font-medium text-neutral-500">
          총 <span className="text-primary">{data.results.length}</span>개 업체
        </p>
        <CompanyResults
          companies={data.results}
          favoritedIds={favorites.map((f) => f.companyId)}
          isUser={isUser}
        />
      </main>
    </div>
  );
}
