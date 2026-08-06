import { Skeleton, CompanyCardGridSkeleton } from "@/components/Skeleton";

export default function FavoritesLoading() {
  return (
    <div className="min-h-full bg-surface-muted">
      <div className="h-[57px] border-b border-neutral-200/80 bg-white/90 dark:border-neutral-800/80 dark:bg-neutral-950/90" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="mb-6 h-8 w-40" />
        <CompanyCardGridSkeleton />
      </main>
    </div>
  );
}
