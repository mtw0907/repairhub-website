"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, Home, Menu, Sparkles, Store, X } from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof Home; match: (path: string) => boolean };

function buildNavItems(isUser: boolean): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "홈", icon: Home, match: (p) => p === "/" },
    { href: "/companies", label: "업체 찾기", icon: Store, match: (p) => p.startsWith("/companies") },
  ];
  if (isUser) {
    items.push(
      {
        href: "/dashboard/repair-requests/new",
        label: "AI 견적",
        icon: Sparkles,
        match: (p) => p.startsWith("/dashboard/repair-requests"),
      },
      {
        href: "/dashboard/reservations",
        label: "예약 현황",
        icon: CalendarClock,
        match: (p) => p.startsWith("/dashboard/reservations"),
      },
    );
  }
  return items;
}

export function SiteNav({ isUser }: { isUser: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = buildNavItems(isUser);

  return (
    <>
      {/* 데스크톱 네비게이션 */}
      <nav className="hidden items-center gap-1 md:flex lg:gap-2">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex items-center gap-2 rounded-full px-3.5 py-2 text-base font-semibold text-primary lg:px-4"
                  : "flex items-center gap-2 rounded-full px-3.5 py-2 text-base font-medium text-neutral-600 transition-colors hover:bg-primary/10 hover:text-primary dark:text-neutral-400 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent lg:px-4"
              }
            >
              <item.icon className={active ? "h-5 w-5 text-primary" : "h-5 w-5"} />
              <span className={active ? "relative" : ""}>
                {item.label}
                {active && (
                  <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 모바일: 햄버거 버튼 */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="메뉴 열기"
        aria-expanded={mobileOpen}
        className="order-last flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-primary/10 hover:text-primary dark:text-neutral-300 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent md:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* 모바일: 드롭다운 메뉴 */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-neutral-200/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/95 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1">
            {items.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    active
                      ? "flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-base font-semibold text-primary"
                      : "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-primary/10 dark:text-neutral-300 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
