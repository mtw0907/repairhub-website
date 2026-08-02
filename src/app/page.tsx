import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const FEATURES = [
  {
    label: "사용자",
    title: "필요한 수리업체를 빠르게",
    description: "지역·브랜드·증상으로 검색하고 비교한 뒤, 예약과 견적까지 한 번에 받아보세요.",
  },
  {
    label: "업체",
    title: "홈페이지 없이도 운영 시작",
    description: "예약·문의·후기 관리와 AI 콘텐츠 작성 도구까지, 별도 홈페이지 없이 바로 운영하세요.",
  },
  {
    label: "관리자",
    title: "AI로 가볍게 운영",
    description: "업체 검수, 신고 분류, 운영 리포트까지 AI가 초안을 만들어 의사결정을 도와드립니다.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pt-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent)]"
          />
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              전국 음향기기 · 악기 수리 플랫폼
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
              믿을 수 있는 수리업체를
              <br />
              <span className="text-brand">가장 빠르게</span> 찾는 방법
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-neutral-500 dark:text-neutral-400">
              검색부터 비교, 예약, 견적, AI 상담까지 — 악기와 음향기기 수리에 필요한 모든 과정을
              한 곳에서 해결하세요.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/companies"
                className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                업체 찾아보기
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
              >
                회원가입
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand">
                  {f.label}
                </p>
                <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {f.title}
                </h2>
                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 px-6 py-8 text-center text-xs text-neutral-400 dark:border-neutral-800">
        © {new Date().getFullYear()} RepairHub. 전국 음향기기 · 악기 수리업체 플랫폼.
      </footer>
    </div>
  );
}
