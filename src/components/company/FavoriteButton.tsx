"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export function FavoriteButton({
  companyId,
  initialFavorited,
  isUser,
  variant = "default",
}: {
  companyId: string;
  initialFavorited: boolean;
  isUser: boolean;
  variant?: "default" | "icon";
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label={favorited ? "찜 해제" : "찜하기"}
        className={
          favorited
            ? "flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-accent shadow-sm ring-1 ring-black/5 transition-transform hover:scale-110 disabled:opacity-50 dark:bg-neutral-900/95"
            : "flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-neutral-500 shadow-sm ring-1 ring-black/5 backdrop-blur transition-transform hover:scale-110 hover:text-accent disabled:opacity-50 dark:bg-neutral-900/85 dark:text-neutral-300"
        }
      >
        <Heart className="h-4.5 w-4.5" fill={favorited ? "currentColor" : "none"} />
      </button>
    );
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
