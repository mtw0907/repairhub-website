"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-primary/30 hover:bg-primary/8 hover:text-primary dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-primary/30 dark:hover:bg-primary/15 dark:hover:text-accent"
    >
      로그아웃
    </button>
  );
}
