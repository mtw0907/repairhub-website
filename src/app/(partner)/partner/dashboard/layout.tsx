import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PendingApprovalNotice } from "@/components/partner/PendingApprovalNotice";

export default async function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // SUPER_ADMIN may browse partner pages without a company/approval gate.
  if (session?.user?.role === "SUPER_ADMIN") {
    return <>{children}</>;
  }

  const companyId = session?.user?.companyId;
  const company = companyId
    ? await prisma.company.findUnique({
        where: { id: companyId },
        select: { status: true, aiVerificationResult: true },
      })
    : null;

  if (!company || company.status !== "APPROVED") {
    return (
      <PendingApprovalNotice
        status={company?.status ?? "PENDING"}
        aiVerificationResult={company?.aiVerificationResult ?? null}
      />
    );
  }

  return <>{children}</>;
}
