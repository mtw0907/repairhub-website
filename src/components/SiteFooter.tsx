import Link from "next/link";

const SERVICE_LINKS = [
  { href: "/companies", label: "업체찾기" },
  { href: "/dashboard/repair-requests/new", label: "AI 수리진단" },
  { href: "/dashboard/reservations", label: "예약" },
  { href: "/faq", label: "고객센터" },
];

// 공개 페이지(홈/업체찾기/업체상세/카테고리/비교/SEO 랜딩)에서 공용으로
// 쓰는 푸터. 로그인 후 마이페이지(DashboardShell 등)에는 적용하지 않는다 —
// 이미 자체 완결된 화면이라 마케팅용 링크가 필요 없다.
export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-6 py-10 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {SERVICE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-medium text-neutral-600 transition-colors hover:text-accent dark:text-neutral-300"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
          <Link href="/terms" className="hover:text-neutral-600 dark:hover:text-neutral-300">
            이용약관
          </Link>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="hover:text-neutral-600 dark:hover:text-neutral-300">
            개인정보처리방침
          </Link>
          <span aria-hidden>·</span>
          <Link href="/faq" className="hover:text-neutral-600 dark:hover:text-neutral-300">
            문의하기
          </Link>
        </div>

        <p className="mt-4 text-xs text-neutral-400">
          사업자등록 완료 후 상호·대표자·사업자등록번호·주소 등 사업자 정보가 이곳에 추가로 고지될 예정입니다.
        </p>

        <p className="mt-3 text-xs text-neutral-400">
          © {new Date().getFullYear()} 소리수리. 전국 전문 장비 수리업체 플랫폼.
        </p>
      </div>
    </footer>
  );
}
