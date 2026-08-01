import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-neutral-400">403</p>
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        접근 권한이 없습니다
      </h1>
      <p className="text-sm text-neutral-500">
        이 페이지에 접근할 수 있는 권한이 없습니다.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
      >
        홈으로 이동
      </Link>
    </div>
  );
}
