import { notFound } from "next/navigation";
import { Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";
import { Card } from "@/components/ui/Card";
import { DeviceDetailActions } from "@/components/user/DeviceDetailActions";
import { DeviceHistoryTabs } from "@/components/user/DeviceHistoryTabs";
import { getCategoryTree } from "@/lib/categories";

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const device = await prisma.userDevice.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });

  if (!device || device.userId !== session!.user.id) {
    notFound();
  }

  const [reservations, repairRequests, categoryTree] = await Promise.all([
    prisma.reservation.findMany({
      where: { deviceId: id },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.repairRequest.findMany({
      where: { deviceId: id },
      orderBy: { createdAt: "desc" },
    }),
    getCategoryTree(),
  ]);

  // 리뷰는 별도 FK 없이, 이 장비로 예약했던 업체들에 대해 사용자가 쓴
  // 리뷰를 역으로 조회해서 구성한다 (schema.prisma UserDevice 주석 참고).
  const companyIds = Array.from(new Set(reservations.map((r) => r.companyId)));
  const reviews =
    companyIds.length > 0
      ? await prisma.review.findMany({
          where: { userId: session!.user.id, companyId: { in: companyIds }, status: "VISIBLE" },
          include: { company: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        })
      : [];

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-muted">
              {device.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={device.photoUrl} alt={device.name} className="h-full w-full object-cover" />
              ) : (
                <Wrench className="h-7 w-7 text-primary/30" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
                {device.name}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                {[device.category?.name, device.brand, device.model].filter(Boolean).join(" · ") || "정보 없음"}
              </p>
              {device.memo && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{device.memo}</p>}
            </div>
          </div>
          <DeviceDetailActions
            device={{
              id: device.id,
              name: device.name,
              categoryId: device.categoryId,
              brand: device.brand ?? "",
              model: device.model ?? "",
              photoUrl: device.photoUrl,
              memo: device.memo ?? "",
            }}
            categoryTree={categoryTree}
          />
        </Card>

        <DeviceHistoryTabs
          reservations={reservations.map((r) => ({
            id: r.id,
            companyName: r.company.name,
            status: r.status,
            method: r.method,
            scheduledAt: r.scheduledAt ? r.scheduledAt.toISOString() : null,
          }))}
          repairRequests={repairRequests.map((rr) => ({
            id: rr.id,
            status: rr.status,
            symptom: rr.symptom,
            createdAt: rr.createdAt.toISOString(),
          }))}
          reviews={reviews.map((rv) => ({
            id: rv.id,
            companyName: rv.company.name,
            rating: rv.rating,
            content: rv.content,
            createdAt: rv.createdAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
