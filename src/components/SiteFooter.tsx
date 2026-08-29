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
    <footer className="bg-primary px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {SERVICE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-medium text-primary-foreground/80 transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-foreground/50">
          <Link href="/terms" className="hover:text-primary-foreground/80">
            이용약관
          </Link>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="hover:text-primary-foreground/80">
            개인정보처리방침
          </Link>
          <span aria-hidden>·</span>
          <Link href="/faq" className="hover:text-primary-foreground/80">
            문의하기
          </Link>
        </div>

        <p className="mt-4 text-xs text-primary-foreground/50">
          사업자등록 완료 후 상호·대표자·사업자등록번호·주소 등 사업자 정보가 이곳에 추가로 고지될 예정입니다.
        </p>

        <p className="mt-3 text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} 소리수리. 전국 전문 장비 수리업체 플랫폼.
        </p>
      </div>
    </footer>
  );
}
