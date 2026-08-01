import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { CompanyResults } from "@/components/company/CompanyResults";
import { getSeoLandingData } from "@/lib/seoLanding";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ keyword: string }>;
}): Promise<Metadata> {
  const { keyword } = await params;
  const data = await getSeoLandingData("BRAND", decodeURIComponent(keyword));
  if (!data) return {};
  return { title: `${data.seoPage.title} | RepairHub`, description: data.seoPage.introText };
}

export default async function BrandLandingPage({
  params,
}: {
  params: Promise<{ keyword: string }>;
}) {
  const { keyword } = await params;
  const data = await getSeoLandingData("BRAND", decodeURIComponent(keyword));
  if (!data) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h1 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {data.seoPage.title}
        </h1>
        <p className="mb-6 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">
          {data.seoPage.introText}
        </p>
        <p className="mb-4 text-sm text-neutral-500">총 {data.results.length}개 업체</p>
        <CompanyResults companies={data.results} />
      </main>
    </div>
  );
}
