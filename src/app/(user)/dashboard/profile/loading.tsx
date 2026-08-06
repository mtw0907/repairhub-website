import { Skeleton } from "@/components/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-full bg-surface-muted">
      <div className="h-[57px] border-b border-neutral-200/80 bg-white/90 dark:border-neutral-800/80 dark:bg-neutral-950/90" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-9 w-24" />
        </div>
      </main>
    </div>
  );
}
