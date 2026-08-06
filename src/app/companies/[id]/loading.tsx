import { Skeleton } from "@/components/Skeleton";

export default function CompanyDetailLoading() {
  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <div className="h-[68px] border-b border-neutral-200/80 bg-white/90 dark:border-neutral-800/80 dark:bg-neutral-950/90" />
      <Skeleton className="h-48 w-full rounded-none sm:h-64" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 sm:px-6">
        <div className="-mt-14 flex items-start gap-4 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 sm:-mt-16 sm:p-6">
          <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Skeleton className="mt-6 h-16 w-full" />
        <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}
