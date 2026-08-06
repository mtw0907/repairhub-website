import { StaffPageHeader } from "@/components/StaffPageHeader";
import { NewCompanyForm } from "@/components/admin/NewCompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="min-h-full bg-surface-muted">
      <StaffPageHeader backHref="/admin/dashboard/companies" backLabel="업체 관리로" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          업체 직접 등록
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          업체가 직접 가입하지 않아도 관리자가 업체 페이지를 생성할 수 있습니다. 등록 시
          &ldquo;미인증 업체&rdquo; 상태로 생성되며, 이후 업체를 초대해 이어받게 하거나 관리자가
          직접 승인 처리할 수 있습니다.
        </p>
        <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <NewCompanyForm />
        </div>
      </main>
    </div>
  );
}
