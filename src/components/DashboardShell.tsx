import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

type Item = string | { label: string; href: string };

export function DashboardShell({
  roleLabel,
  userName,
  sections,
}: {
  roleLabel: string;
  userName: string;
  sections: { title: string; items: Item[] }[];
}) {
  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground sm:flex"
            >
              R
            </Link>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand">
                {roleLabel}
              </p>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                안녕하세요, {userName}님
              </h1>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                <span className="h-3.5 w-1 rounded-full bg-brand" />
                {section.title}
              </h2>
              <ul className="space-y-0.5 text-sm">
                {section.items.map((item) => {
                  const label = typeof item === "string" ? item : item.label;
                  const href = typeof item === "string" ? null : item.href;
                  return (
                    <li key={label}>
                      {href ? (
                        <Link
                          href={href}
                          className="group -mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                        >
                          <span className="flex-1">{label}</span>
                          <span className="text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand dark:text-neutral-600">
                            →
                          </span>
                        </Link>
                      ) : (
                        <div className="-mx-2 flex items-center gap-2 px-2 py-1.5 text-neutral-400 dark:text-neutral-600">
                          <span className="flex-1">{label}</span>
                          <span className="text-xs">예정</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
