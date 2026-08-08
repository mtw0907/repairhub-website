import Link from "next/link";
import {
  Search,
  Guitar,
  Drum,
  Piano,
  Wind,
  Music,
  Speaker,
  Mic,
  Star,
  Wrench,
  ArrowRight,
  Sparkles,
  PenLine,
  Megaphone,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CompanyCard, type CompanySummary } from "@/components/company/CompanyCard";
import { AiChatWidget } from "@/components/ai/AiChatWidget";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { INSTRUMENT_CATEGORIES } from "@/lib/constants";

const PARTNER_AI_SHORTCUTS = [
  { href: "/partner/dashboard/ai/blog", label: "블로그 작성", icon: PenLine },
  { href: "/partner/dashboard/ai/ad-copy", label: "광고 문구", icon: Megaphone },
  { href: "/partner/dashboard/ai/faq", label: "FAQ 생성", icon: HelpCircle },
  { href: "/partner/dashboard/ai/customer-chat", label: "고객 상담", icon: MessageCircle },
];

const CATEGORY_ICONS: Record<string, typeof Guitar> = {
  guitar: Guitar,
  drum: Drum,
  piano: Piano,
  wind: Wind,
  music: Music,
  speaker: Speaker,
  mic: Mic,
};

function toCompanySummary(c: {
  id: string;
  name: string;
  region: string | null;
  address: string | null;
  introduction: string | null;
  services: { name: string }[];
  brands: { name: string }[];
  onSiteVisit: boolean;
  courierDrop: boolean;
  reviews: { rating: number }[];
  logoUrl: string | null;
  photos: string | null;
  isPremium: boolean;
  isFeatured: boolean;
  status: string;
}): CompanySummary {
  const reviewCount = c.reviews.length;
  const avgRating =
    reviewCount > 0 ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;
  const photos: string[] = c.photos ? JSON.parse(c.photos) : [];
  return {
    id: c.id,
    name: c.name,
    region: c.region,
    address: c.address,
    introduction: c.introduction,
    services: c.services.map((s) => s.name),
    brands: c.brands.map((b) => b.name),
    onSiteVisit: c.onSiteVisit,
    courierDrop: c.courierDrop,
    avgRating,
    reviewCount,
    logoUrl: c.logoUrl,
    photoUrl: photos[0] ?? null,
    isPremium: c.isPremium,
    isFeatured: c.isFeatured,
    status: c.status,
  };
}

function maskName(name: string) {
  if (name.length <= 1) return `${name}*`;
  return `${name[0]}${"*".repeat(name.length - 1)}`;
}

export default async function LandingPage() {
  const session = await auth();
  const isUser = session?.user?.role === "USER";
  const isPartner = session?.user?.role === "PARTNER";
  const companyInclude = {
    services: true,
    brands: true,
    reviews: { where: { status: "VISIBLE" as const }, select: { rating: true } },
  };

  const [popularRaw, newRaw, workCases, reviews] = await Promise.all([
    prisma.company.findMany({
      where: { status: "APPROVED" },
      include: companyInclude,
      orderBy: [{ isFeatured: "desc" }, { isPremium: "desc" }, { viewCount: "desc" }],
      take: 6,
    }),
    prisma.company.findMany({
      where: { status: "APPROVED" },
      include: companyInclude,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.workCase.findMany({
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.review.findMany({
      where: { status: "VISIBLE" },
      include: { user: { select: { name: true } }, company: { select: { id: true, name: true } } },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
  ]);

  const popular = popularRaw.map(toCompanySummary);
  const fresh = newRaw.map(toCompanySummary);

  const allIds = Array.from(new Set([...popular, ...fresh].map((c) => c.id)));
  const favorites =
    isUser && allIds.length > 0
      ? await prisma.favorite.findMany({
          where: { userId: session!.user.id, companyId: { in: allIds } },
          select: { companyId: true },
        })
      : [];
  const favoritedIds = new Set(favorites.map((f) => f.companyId));

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28">
          {/* 배경: /public/assets/hero-repair.jpg가 있으면 그 사진을, 없으면
              남색 그라데이션으로 대체 (CSS 다중 배경 — 이미지 404 시 자동으로
              두 번째 레이어만 남음). 실제 사진을 준비하면 같은 경로에 넣기만
              하면 됩니다. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(/assets/hero-repair.jpg), linear-gradient(135deg, #0f1620 0%, #1e293b 55%, #2c3b52 100%)",
            }}
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_srgb,var(--accent)_25%,transparent),transparent)]"
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
              전국 음향기기 · 악기 수리 플랫폼
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
              믿을 수 있는 악기 수리,
              <br />
              <span className="text-accent">소리수리</span>에서 한 번에
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              악기와 음향기기 수리업체를 찾고,
              <br className="hidden sm:block" />
              AI 견적부터 예약까지 한 번에
            </p>

            <form
              action="/companies"
              className="mx-auto mt-9 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-2xl sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-2 px-3 py-3">
                <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                <input
                  type="text"
                  name="keyword"
                  placeholder="악기, 브랜드, 업체명을 검색하세요."
                  className="w-full min-w-0 border-0 bg-transparent text-base text-neutral-800 outline-none placeholder:text-neutral-400"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] hover:bg-primary/90"
              >
                업체 찾기
              </button>
            </form>

            <div className="mt-5 flex justify-center gap-3 text-sm">
              <Link href="/companies" className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
                전체 업체 둘러보기
              </Link>
              <span className="text-white/30">·</span>
              <Link href="/register" className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
                회원가입
              </Link>
            </div>
          </div>
        </section>

        {/* 악기 카테고리 */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="mb-5 text-xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-2xl">
            악기 카테고리별로 찾기
          </h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {INSTRUMENT_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon] ?? Music;
              return (
                <Link
                  key={cat.label}
                  href={`/companies?keyword=${encodeURIComponent(cat.label)}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-200/70 bg-white p-3 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 sm:p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-accent/20 group-hover:text-accent dark:text-neutral-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 sm:text-xs">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* AI 상담 */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-gradient-to-r from-primary to-primary/85 px-5 py-4 dark:border-neutral-800 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-accent">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white sm:text-lg">
                    AI 어시스턴트에게 바로 물어보기
                  </h2>
                  <p className="text-xs text-white/70 sm:text-sm">
                    {isPartner
                      ? "블로그, 광고 문구, FAQ, 고객 상담까지 AI로 빠르게 준비해보세요"
                      : "수리 증상이나 궁금한 점을 지금 바로 상담해보세요"}
                  </p>
                </div>
              </div>
              {isPartner && (
                <div className="flex flex-wrap gap-1.5">
                  {PARTNER_AI_SHORTCUTS.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                    >
                      <s.icon className="h-3.5 w-3.5" />
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {isUser ? (
              <div className="grid gap-4 p-4 sm:grid-cols-5 sm:p-5">
                <div className="sm:col-span-3">
                  <AiChatWidget compact />
                </div>
                <Link
                  href="/dashboard/repair-requests/new"
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-center shadow-md transition-transform hover:scale-[1.02] sm:col-span-2"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 text-accent-foreground">
                    <Wrench className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-xl font-extrabold text-accent-foreground">AI 수리 견적 매칭</p>
                    <p className="mt-1 text-sm text-accent-foreground/80">
                      증상 입력하고 업체 견적 받아보기
                    </p>
                  </div>
                  <span className="mt-1 flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-primary transition-transform group-hover:translate-x-1">
                    지금 시작하기
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            ) : isPartner ? (
              <div className="p-4 sm:p-5">
                <AiChatWidget mode="partner" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  로그인하면 AI 상담사에게 고장 증상, 예상 수리비, 업체 추천까지 바로 물어볼 수 있어요.
                </p>
                <Link
                  href="/login"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90"
                >
                  로그인하고 AI 상담 받아보기
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 인기 업체 (내 주변 인기업체 포함 — 위치 기반 데이터가 없어 평점/추천 기준으로 통합 제공) */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                지금 인기 있는 업체
              </h2>
              <p className="mt-1 text-sm text-neutral-500">평점과 추천 지수가 높은 업체예요</p>
            </div>
            <Link
              href="/companies"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              전체보기 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {popular.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((c) => (
                <CompanyCard key={c.id} company={c} isUser={isUser} favorited={favoritedIds.has(c.id)} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
              아직 등록된 업체가 없습니다.
            </p>
          )}
        </section>

        {/* 신규 업체 */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                새로 합류한 업체
              </h2>
              <p className="mt-1 text-sm text-neutral-500">소리수리에 최근 등록된 업체예요</p>
            </div>
          </div>
          {fresh.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {fresh.map((c) => (
                <CompanyCard key={c.id} company={c} isUser={isUser} favorited={favoritedIds.has(c.id)} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
              아직 등록된 업체가 없습니다.
            </p>
          )}
        </section>

        {/* 수리사례 */}
        {workCases.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="mb-5 text-xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-2xl">
              수리 사례
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {workCases.map((w) => {
                const photos: string[] = w.photos ? JSON.parse(w.photos) : [];
                return (
                  <Link
                    key={w.id}
                    href={`/companies/${w.company.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/15">
                      {photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photos[0]}
                          alt={w.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary/25">
                          <Wrench className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3.5">
                      <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {w.title}
                      </h3>
                      <p className="mt-auto truncate text-xs text-neutral-500">{w.company.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 후기 */}
        {reviews.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:pb-20">
            <h2 className="mb-5 text-xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-2xl">
              실제 이용 후기
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {reviews.map((r) => (
                <Link
                  key={r.id}
                  href={`/companies/${r.company.id}`}
                  className="flex flex-col gap-2.5 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-1 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5" fill={i < r.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="line-clamp-3 flex-1 text-sm text-neutral-700 dark:text-neutral-300">
                    {r.content}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {maskName(r.user.name)} 님 · {r.company.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-neutral-200 bg-white px-6 py-8 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950">
        © {new Date().getFullYear()} 소리수리. 전국 음향기기 · 악기 수리업체 플랫폼.
      </footer>
    </div>
  );
}
