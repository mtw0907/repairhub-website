"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-accent/50 hover:bg-accent/10 hover:text-accent dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-accent/40 dark:hover:bg-accent/15 dark:hover:text-accent"
    >
      로그아웃
    </button>
  );
}
