import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";
import { CompanyInfoForm } from "@/components/partner/CompanyInfoForm";
import { TagListManager } from "@/components/partner/TagListManager";
import { PriceItemManager } from "@/components/partner/PriceItemManager";

export default async function PartnerCompanyPage() {
  const session = await auth();
  const companyId = session!.user.companyId!;

  const company = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    include: { services: true, brands: true, priceItems: true },
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/partner/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl space-y-10 px-6 py-8">
        <div>
          <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            업체 정보 수정
          </h1>
          <CompanyInfoForm
            initial={{
              name: company.name,
              ownerName: company.ownerName ?? "",
              bizRegNo: company.bizRegNo ?? "",
              address: company.address ?? "",
              region: company.region ?? "",
              phone: company.phone ?? "",
              homepage: company.homepage ?? "",
              introduction: company.introduction ?? "",
              seoDescription: company.seoDescription ?? "",
              businessHours: company.businessHours ?? "",
              closedDays: company.closedDays ?? "",
              onSiteVisit: company.onSiteVisit,
              courierDrop: company.courierDrop,
              logoUrl: company.logoUrl ?? "",
              photos: company.photos ? JSON.parse(company.photos) : [],
            }}
          />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            서비스 관리
          </h2>
          <div className="space-y-6">
            <TagListManager
              title="수리 품목"
              addEndpoint="/api/partner/services"
              deleteEndpointBase="/api/partner/services"
              items={company.services}
              placeholder="예: 기타 수리"
            />
            <TagListManager
              title="취급 브랜드"
              addEndpoint="/api/partner/brands"
              deleteEndpointBase="/api/partner/brands"
              items={company.brands}
              placeholder="예: Fender"
            />
            <PriceItemManager items={company.priceItems} />
          </div>
        </div>
      </main>
    </div>
  );
}
