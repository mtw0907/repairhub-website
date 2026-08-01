import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { NewCompanyForm } from "@/components/admin/NewCompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <Link href="/admin/dashboard/companies" className="text-sm text-neutral-500 hover:underline">
          ← 업체 관리로
        </Link>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          업체 직접 등록
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          업체가 직접 가입하지 않아도 관리자가 업체 페이지를 생성할 수 있습니다. 등록 시
          &ldquo;미인증 업체&rdquo; 상태로 생성되며, 이후 업체를 초대해 이어받게 하거나 관리자가
          직접 승인 처리할 수 있습니다.
        </p>
        <NewCompanyForm />
      </main>
    </div>
  );
}
