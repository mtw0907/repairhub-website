import { UserCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";
import { ProfileForm } from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          <UserCircle className="h-6 w-6 text-accent" />
          마이페이지
        </h1>
        <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <p className="mb-6 text-sm text-neutral-500">이메일: {user.email}</p>
          <ProfileForm
            initialName={user.name}
            initialPhone={user.phone ?? ""}
            hasPassword={!!user.password}
          />
        </div>
      </main>
    </div>
  );
}
