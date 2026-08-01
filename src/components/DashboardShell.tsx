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
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {roleLabel}
          </p>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            안녕하세요, {userName}님
          </h1>
        </div>
        <SignOutButton />
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {section.title}
              </h2>
              <ul className="space-y-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                {section.items.map((item) => {
                  const label = typeof item === "string" ? item : item.label;
                  const href = typeof item === "string" ? null : item.href;
                  return (
                    <li key={label} className="flex items-center gap-2">
                      <span className="inline-block h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                      {href ? (
                        <Link href={href} className="hover:underline">
                          {label}
                        </Link>
                      ) : (
                        <span>{label}</span>
                      )}
                      {!href && (
                        <span className="ml-auto text-xs text-neutral-300 dark:text-neutral-600">
                          예정
                        </span>
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
