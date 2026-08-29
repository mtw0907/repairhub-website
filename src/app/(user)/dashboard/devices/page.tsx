import { Wrench } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";
import { DeviceListView } from "@/components/user/DeviceListView";
import { getCategoryTree } from "@/lib/categories";

export default async function DevicesPage() {
  const session = await auth();

  const [devices, categoryTree] = await Promise.all([
    prisma.userDevice.findMany({
      where: { userId: session!.user.id },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getCategoryTree(),
  ]);

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          <Wrench className="h-6 w-6 text-accent" />
          내 장비
        </h1>
        <DeviceListView
          devices={devices.map((d) => ({
            id: d.id,
            name: d.name,
            brand: d.brand,
            model: d.model,
            photoUrl: d.photoUrl,
            categoryName: d.category?.name ?? null,
          }))}
          categoryTree={categoryTree}
        />
      </main>
    </div>
  );
}
