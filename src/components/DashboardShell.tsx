import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

type Item = string | { label: string; href: string };

export function DashboardShell({
  roleLabel,
  userName,
  sections,
}: {
  roleLabel: string;
  userName: string;
  sections: { title: string; icon: LucideIcon; items: Item[] }[];
}) {
  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden h-9 w-9 items-center justify-center rounded-lg bg-brand text-base font-bold text-brand-foreground sm:flex"
            >
              R
            </Link>
            <div>
              <p className="text-sm font-medium text-brand">{roleLabel}</p>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                안녕하세요, {userName}님
              </h1>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const label = typeof item === "string" ? item : item.label;
                    const href = typeof item === "string" ? null : item.href;
                    return (
                      <li key={label}>
                        {href ? (
                          <Link
                            href={href}
                            className="group flex items-center gap-2 rounded-xl px-3 py-3 text-[15px] font-medium text-neutral-700 transition-colors hover:bg-brand/5 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-brand/10 dark:hover:text-neutral-100"
                          >
                            <span className="flex-1 leading-snug">{label}</span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand dark:text-neutral-600" />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 rounded-xl px-3 py-3 text-[15px] text-neutral-400 dark:text-neutral-600">
                            <span className="flex-1 leading-snug">{label}</span>
                            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                              예정
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
