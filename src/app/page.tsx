import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-400">
          RepairHub
        </p>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-4xl">
          전국 음향기기 · 악기 수리업체를
          <br />
          검색, 비교, 예약하세요
        </h1>
        <p className="text-neutral-500">
          업체 운영, 예약 관리, AI 상담까지 하나의 플랫폼에서
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          로그인
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
