import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StaffPageHeader } from "@/components/StaffPageHeader";
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
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/partner/dashboard" />
      <main className="mx-auto max-w-2xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
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
          <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">
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
