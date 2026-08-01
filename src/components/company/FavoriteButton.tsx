"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  companyId,
  initialFavorited,
  isUser,
}: {
  companyId: string;
  initialFavorited: boolean;
  isUser: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isUser) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        favorited
          ? "rounded-md border border-amber-400 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 disabled:opacity-50 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-300"
          : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      }
    >
      {favorited ? "★ 즐겨찾기됨" : "☆ 즐겨찾기"}
    </button>
  );
}
