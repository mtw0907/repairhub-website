import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";
import { NewRepairRequestForm } from "@/components/repair/NewRepairRequestForm";
import { REPAIR_REQUEST_DAILY_LIMIT } from "@/lib/constants";
import { getCategoryTree } from "@/lib/categories";

export default async function NewRepairRequestPage() {
  const session = await auth();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [todayCount, categoryTree] = await Promise.all([
    prisma.repairRequest.count({
      where: { userId: session!.user.id, createdAt: { gte: todayStart } },
    }),
    getCategoryTree(),
  ]);
  const remaining = Math.max(REPAIR_REQUEST_DAILY_LIMIT - todayCount, 0);

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            <Sparkles className="h-6 w-6 text-accent" />
            AI 수리 견적 매칭
          </h1>
          <span
            className={
              remaining > 0
                ? "rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                : "rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-400"
            }
          >
            오늘 남은 이용 횟수 {remaining}/{REPAIR_REQUEST_DAILY_LIMIT}
          </span>
        </div>
        <NewRepairRequestForm remaining={remaining} dailyLimit={REPAIR_REQUEST_DAILY_LIMIT} categoryTree={categoryTree} />
      </main>
    </div>
  );
}
