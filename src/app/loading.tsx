import { Skeleton, CompanyCardGridSkeleton } from "@/components/Skeleton";

export default function LandingLoading() {
  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <div className="h-[68px] border-b border-neutral-200/80 bg-white/90 dark:border-neutral-800/80 dark:bg-neutral-950/90" />
      <div className="bg-primary px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <Skeleton className="mx-auto h-5 w-48 bg-white/10" />
          <Skeleton className="mx-auto h-10 w-full max-w-md bg-white/10" />
          <Skeleton className="mx-auto mt-8 h-14 w-full max-w-xl rounded-2xl bg-white/20" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Skeleton className="mb-5 h-7 w-56" />
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Skeleton className="mb-5 h-7 w-56" />
        <CompanyCardGridSkeleton />
      </div>
    </div>
  );
}
