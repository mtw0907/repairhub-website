import { Skeleton, CompanyCardGridSkeleton } from "@/components/Skeleton";

export default function CompaniesLoading() {
  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <div className="h-[68px] border-b border-neutral-200/80 bg-white/90 dark:border-neutral-800/80 dark:bg-neutral-950/90" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="mb-5 h-8 w-48" />
        <Skeleton className="mb-6 h-16 w-full rounded-2xl" />
        <div className="mb-8 flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="mb-4 h-4 w-24" />
        <CompanyCardGridSkeleton />
      </main>
    </div>
  );
}
