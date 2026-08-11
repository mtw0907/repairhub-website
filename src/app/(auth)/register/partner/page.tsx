import Link from "next/link";
import { PartnerRegisterForm } from "@/components/auth/PartnerRegisterForm";

export default function PartnerRegisterPage() {
  return (
    <div className="flex flex-1 justify-center bg-surface-muted px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
            업체 회원가입
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            사업자등록번호 · 업체 위치 · 사업자등록증 제출이 필요합니다
          </p>
        </div>

        <PartnerRegisterForm />

        <p className="text-center text-sm text-neutral-500">
          일반 사용자이신가요?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-accent dark:hover:text-accent"
          >
            일반 회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
