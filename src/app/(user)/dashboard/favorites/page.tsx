import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

export default async function FavoritesPage() {
  const session = await auth();
  const favorites = await prisma.favorite.findMany({
    where: { userId: session!.user.id },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← 대시보드로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          즐겨찾기한 업체
        </h1>
        <div className="space-y-3">
          {favorites.map((f) => (
            <Link
              key={f.id}
              href={`/companies/${f.company.id}`}
              className="block rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {f.company.name}
              </p>
              <p className="text-sm text-neutral-500">{f.company.region ?? f.company.address}</p>
            </Link>
          ))}
          {favorites.length === 0 && (
            <p className="text-sm text-neutral-500">
              아직 즐겨찾기한 업체가 없습니다.{" "}
              <Link href="/companies" className="underline">
                업체 찾기
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
