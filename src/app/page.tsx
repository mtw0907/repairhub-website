import Link from "next/link";
import {
  Search,
  Star,
  Wrench,
  ArrowRight,
  ChevronRight,
  Sparkles,
  PenLine,
  Megaphone,
  HelpCircle,
  MessageCircle,
  Store,
  CalendarClock,
  Building2,
  ShieldCheck,
  Grid3x3,
  Guitar,
  Speaker,
  Camera,
  Plane,
  Printer,
  Scale,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CompanyCard, type CompanySummary } from "@/components/company/CompanyCard";
import { AiChatWidget } from "@/components/ai/AiChatWidget";
import { HomeMapPreview } from "@/components/home/HomeMapPreview";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSetting } from "@/lib/systemSettings";
import { POPULAR_CATEGORY_SLUGS } from "@/lib/constants";
import { getCategoryTree, getCategoryIcon } from "@/lib/categories";
import { maskName } from "@/lib/format";
import { haversineDistanceKm, formatDistanceKm, DEFAULT_MAP_CENTER } from "@/lib/geo";

const PARTNER_AI_SHORTCUTS = [
  { href: "/partner/dashboard/ai/blog", label: "블로그 작성", icon: PenLine },
  { href: "/partner/dashboard/ai/ad-copy", label: "광고 문구", icon: Megaphone },
  { href: "/partner/dashboard/ai/faq", label: "FAQ 생성", icon: HelpCircle },
  { href: "/partner/dashboard/ai/customer-chat", label: "고객 상담", icon: MessageCircle },
];

const FEATURE_LINKS = [
  { href: "/companies", title: "업체 찾기", desc: "내 주변 전문 장비 수리업체를 쉽게 찾아보세요.", icon: Store },
  {
    href: "/dashboard/repair-requests/new",
    title: "AI 수리진단",
    desc: "AI가 분석하고 여러 업체의 견적을 비교해보세요.",
    icon: Sparkles,
  },
  {
    href: "/dashboard/reservations",
    title: "예약 현황",
    desc: "예약한 수리 내역과 진행 상황을 확인하세요.",
    icon: CalendarClock,
  },
  {
    href: "#ai-assistant",
    title: "수리 가이드",
    desc: "고장 증상을 AI에게 물어보고 안내받으세요.",
    icon: MessageCircle,
  },
];

// Hero 검색창 아래 예시 칩. 실제 사진/일러스트 대신 카테고리 아이콘 콜라주로
// "여러 전문 장비를 다룬다"는 인상을 준다 — 아래 HERO_COLLAGE와 함께 쓰인다.
const EXAMPLE_QUERIES = ["기타 줄이 버징나요", "JBL 스피커 전원이 안켜져요", "소니 카메라 렌즈 오류", "DJI 드론 추락"];

const HERO_COLLAGE = [
  { icon: Guitar, className: "left-2 top-6 h-16 w-16 rotate-[-8deg] sm:h-20 sm:w-20" },
  { icon: Speaker, className: "left-24 top-0 h-14 w-14 rotate-[6deg] sm:h-16 sm:w-16" },
  { icon: Camera, className: "left-4 top-32 h-14 w-14 rotate-[4deg] sm:h-16 sm:w-16" },
  { icon: Plane, className: "left-28 top-24 h-16 w-16 rotate-[-4deg] sm:h-20 sm:w-20" },
  { icon: Printer, className: "left-8 top-56 h-12 w-12 rotate-[-6deg] sm:h-14 sm:w-14" },
];

// AI 수리진단 소개 섹션의 4단계 설명 (지시서 5번 SECTION 3).
const AI_STEPS = [
  "장비 선택",
  "증상 입력",
  "사진 첨부",
  "예상 문제 분석 후 여러 업체에 견적 요청",
];

// 견적 비교 소개 섹션의 목업 카드 — 실제 데이터 아님, UI 예시용 (지시서 SECTION 5).
const MOCK_QUOTES = [
  { name: "업체 A", price: "45,000원", duration: "2일", rating: "4.9" },
  { name: "업체 B", price: "60,000원", duration: "1일", rating: "4.8" },
  { name: "업체 C", price: "50,000원", duration: "3일", rating: "5.0" },
];

function toCompanySummary(c: {
  id: string;
  name: string;
  region: string | null;
  address: string | null;
  introduction: string | null;
  services: { name: string }[];
  brands: { name: string }[];
  categories: { category: { name: string; slug: string; parent: { name: string; slug: string } | null } }[];
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
  const categoryNames = Array.from(
    new Set(c.categories.flatMap((cc) => [cc.category.name, cc.category.parent?.name].filter((s): s is string => !!s))),
  );
  return {
    id: c.id,
    name: c.name,
    region: c.region,
    address: c.address,
    introduction: c.introduction,
    services: c.services.map((s) => s.name),
    brands: c.brands.map((b) => b.name),
    categoryNames,
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

export default async function LandingPage() {
  const session = await auth();
  const isUser = session?.user?.role === "USER";
  const isPartner = session?.user?.role === "PARTNER";
  const companyInclude = {
    services: true,
    brands: true,
    categories: {
      include: { category: { select: { name: true, slug: true, parent: { select: { name: true, slug: true } } } } },
    },
    reviews: { where: { status: "VISIBLE" as const }, select: { rating: true } },
  };

  const [
    popularRaw,
    newRaw,
    workCases,
    reviews,
    kakaoMapKey,
    approvedCompanyCount,
    categoryTree,
    repairRequestCount,
    ratingAgg,
  ] = await Promise.all([
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
    getSetting("KAKAO_MAP_JS_KEY"),
    prisma.company.count({ where: { status: "APPROVED" } }),
    getCategoryTree(),
    prisma.repairRequest.count(),
    prisma.review.aggregate({ where: { status: "VISIBLE" }, _avg: { rating: true } }),
  ]);

  const popularCategories = POPULAR_CATEGORY_SLUGS.map((slug) =>
    categoryTree.find((c) => c.slug === slug),
  ).filter((c): c is NonNullable<typeof c> => c !== undefined);

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

  const companyPool = Array.from(new Map([...popularRaw, ...newRaw].map((c) => [c.id, c])).values());
  // "내 주변 추천 수리업체" — 브라우저 위치 접근 없이 서버에서 렌더링해야
  // 해서, 기본 지도 중심(서울시청)으로부터의 거리 기준으로 정렬한 미리보기.
  // 실제 내 위치 기반 정밀 검색은 /companies 페이지에서 제공한다.
  const nearby = companyPool
    .filter((c) => c.latitude != null && c.longitude != null)
    .map((c) => {
      const distanceKm = haversineDistanceKm(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng, c.latitude!, c.longitude!);
      return { ...toCompanySummary(c), distanceLabel: formatDistanceKm(distanceKm), distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);

  const mapCompanies = Array.from(
    new Map(
      companyPool
        .filter((c) => c.latitude != null && c.longitude != null)
        .map((c) => [c.id, { id: c.id, name: c.name, lat: c.latitude as number, lng: c.longitude as number }]),
    ).values(),
  ).slice(0, 8);

  const STATS = [
    { title: `등록 수리업체 ${approvedCompanyCount}곳`, desc: "믿을 수 있는 검증된 업체", icon: Building2 },
    { title: `누적 견적 요청 ${repairRequestCount}건`, desc: "AI가 분석한 수리 상담", icon: Sparkles },
    {
      title: ratingAgg._avg.rating ? `평균 만족도 ${ratingAgg._avg.rating.toFixed(1)}점` : "실제 이용 후기 기반",
      desc: "이용자가 직접 남긴 리뷰 평점",
      icon: Star,
    },
    { title: "안전한 예약 시스템", desc: "소리수리가 보증하는 안심 거래", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{
              backgroundImage: "linear-gradient(135deg, #0f1620 0%, #1e293b 55%, #2c3b52 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent)]"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="text-center lg:text-left">
              <p className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                전국 전문 장비 수리 플랫폼
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                고장난 장비,
                <br />
                <span className="text-accent">어디서 수리</span>할까요?
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/80 sm:text-lg lg:mx-0">
                악기 · 음향 · 카메라 · 영상 · 드론 · 3D프린터까지
                <br className="hidden sm:block" />
                가까운 전문 수리업체를 찾고 견적을 비교하세요.
              </p>

              <form
                action="/companies"
                className="mx-auto mt-9 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-2xl sm:flex-row lg:mx-0"
              >
                <div className="flex flex-1 items-center gap-2 px-3 py-3">
                  <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                  <input
                    type="text"
                    name="keyword"
                    placeholder="장비명 또는 고장 증상을 입력하세요"
                    className="w-full min-w-0 border-0 bg-transparent text-base text-neutral-800 outline-none placeholder:text-neutral-400"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] hover:bg-primary/90"
                >
                  업체 찾기
                </button>
                <Link
                  href="/dashboard/repair-requests/new"
                  className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-accent-foreground shadow-lg shadow-accent/30 transition-transform hover:scale-[1.02] hover:bg-accent/90"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  AI 수리진단
                </Link>
              </form>

              <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-1.5 lg:mx-0 lg:justify-start">
                {EXAMPLE_QUERIES.map((q) => (
                  <Link
                    key={q}
                    href={`/companies?keyword=${encodeURIComponent(q)}`}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
                  >
                    {q}
                  </Link>
                ))}
              </div>

              <div className="mt-5 flex justify-center gap-3 text-sm lg:justify-start">
                <Link href="/companies" className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
                  전체 업체 둘러보기
                </Link>
                <span className="text-white/30">·</span>
                <Link href="/register" className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
                  회원가입
                </Link>
              </div>
            </div>

            {/* 여러 전문 장비를 다룬다는 인상을 주는 아이콘 콜라주 — 실제
                사진/일러스트 대신 카테고리 아이콘을 카드형으로 겹쳐 배치.
                나중에 실제 사진을 준비하면 이 블록을 <img>로 교체 가능. */}
            <div className="relative hidden h-72 lg:block" aria-hidden>
              {HERO_COLLAGE.map(({ icon: Icon, className }, i) => (
                <span
                  key={i}
                  className={`absolute flex items-center justify-center rounded-2xl bg-white/95 text-primary shadow-xl ${className}`}
                >
                  <Icon className="h-1/2 w-1/2" />
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 기능 바로가기 */}
        <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {FEATURE_LINKS.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group flex items-center gap-3 rounded-2xl border border-primary/15 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md dark:border-primary/25 dark:bg-neutral-900"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-accent/20 group-hover:text-accent">
                  <f.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {f.title}
                  </span>
                  <span className="hidden truncate text-xs text-neutral-500 sm:block">{f.desc}</span>
                </span>
                <ChevronRight className="ml-auto hidden h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent sm:block" />
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 카테고리 */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionTitle
            title="어떤 장비를 수리하시나요?"
            action={
              <Link
                href="/categories"
                className="flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-accent"
              >
                <Grid3x3 className="h-4 w-4" />
                전체 카테고리 보기
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {popularCategories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const sample = cat.children.slice(0, 2).map((c) => c.name).join(" · ");
              return (
                <Link
                  key={cat.id}
                  href={`/companies?category=${cat.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-primary/15 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md dark:border-primary/25 dark:bg-neutral-900"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-accent/20 group-hover:text-accent dark:text-neutral-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {cat.name}
                    </span>
                    {sample && <span className="block truncate text-xs text-neutral-500">{sample}</span>}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* AI 수리진단 소개 */}
        <section id="ai-assistant" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm dark:border-primary/25 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-primary px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-accent">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-primary-foreground sm:text-lg">
                    AI가 먼저 증상을 정리해드립니다
                  </h2>
                  <p className="text-xs text-primary-foreground/70 sm:text-sm">
                    {isPartner
                      ? "블로그, 광고 문구, FAQ, 고객 상담까지 AI로 빠르게 준비해보세요"
                      : "장비 선택부터 견적 요청까지, 로그인 없이도 진행할 수 있어요"}
                  </p>
                </div>
              </div>
              {isPartner && (
                <div className="flex flex-wrap gap-1.5">
                  {PARTNER_AI_SHORTCUTS.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-accent/20 hover:text-accent"
                    >
                      <s.icon className="h-3.5 w-3.5" />
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {isPartner ? (
              <div className="p-4 sm:p-5">
                <AiChatWidget mode="partner" />
              </div>
            ) : (
              <div className="grid gap-6 p-5 sm:grid-cols-5 sm:p-6">
                <div className="sm:col-span-3">
                  <AiChatWidget compact />
                </div>
                <div className="flex flex-col justify-center gap-4 sm:col-span-2">
                  <ol className="space-y-2.5">
                    {AI_STEPS.map((step, i) => (
                      <li key={step} className="flex items-start gap-2.5 text-sm font-medium text-primary dark:text-neutral-100">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary dark:text-neutral-100">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <Link
                    href="/dashboard/repair-requests/new"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-accent/90"
                  >
                    AI 수리진단 시작하기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 내 주변 추천 수리업체 */}
        {nearby.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <SectionTitle title="내 주변 추천 수리업체" subtitle="가까운 거리부터 보여드려요" />
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
              {nearby.map((c) => (
                <div key={c.id} className="w-64 shrink-0 sm:w-auto">
                  <CompanyCard company={c} isUser={isUser} favorited={favoritedIds.has(c.id)} compact />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 견적 비교 소개 */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionTitle title="여러 업체 견적을 한 번에 비교하세요" subtitle="가격, 기간, 평점까지 나란히 놓고 골라보세요" />
          <div className="grid gap-4 sm:grid-cols-3">
            {MOCK_QUOTES.map((q) => (
              <div
                key={q.name}
                className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm dark:border-primary/25 dark:bg-neutral-900"
              >
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{q.name}</p>
                <p className="mt-2 text-2xl font-extrabold text-primary dark:text-neutral-100">{q.price}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                  <span>예상 {q.duration}</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    {q.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-neutral-400">위 카드는 화면 예시이며 실제 견적 데이터가 아닙니다.</p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/compare"
              className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] hover:bg-primary/90"
            >
              <Scale className="h-4.5 w-4.5" />
              견적 비교 시작하기
            </Link>
          </div>
        </section>

        {/* 인기 업체 + 신규 업체 + 내 주변 지도 */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-3 lg:items-stretch">
            <div className="flex flex-col gap-10 lg:col-span-2">
              <div>
                <SectionTitle title="지금 인기 있는 업체" subtitle="평점과 추천 지수가 높은 업체예요" />
                {popular.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-3">
                    {popular.slice(0, 3).map((c) => (
                      <CompanyCard key={c.id} company={c} isUser={isUser} favorited={favoritedIds.has(c.id)} compact />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="아직 등록된 업체가 없습니다." />
                )}
              </div>

              <div>
                <SectionTitle title="새로 합류한 업체" subtitle="소리수리에 최근 등록된 업체예요" />
                {fresh.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-3">
                    {fresh.slice(0, 3).map((c) => (
                      <CompanyCard key={c.id} company={c} isUser={isUser} favorited={favoritedIds.has(c.id)} compact />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="아직 등록된 업체가 없습니다." />
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <SectionTitle title="내 주변 수리업체" />
              <div className="min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-primary/15 shadow-sm dark:border-primary/25">
                <HomeMapPreview companies={mapCompanies} kakaoMapKey={kakaoMapKey} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/companies"
              className="flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-bold text-accent-foreground shadow-md transition-transform hover:scale-[1.02] hover:bg-accent/90"
            >
              업체 전체보기 <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </section>

        {/* 수리사례 */}
        {workCases.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <SectionTitle title="수리 사례" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {workCases.map((w) => {
                const photos: string[] = w.photos ? JSON.parse(w.photos) : [];
                return (
                  <Link
                    key={w.id}
                    href={`/companies/${w.company.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-primary/25 dark:bg-neutral-900"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
                      {photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photos[0]}
                          alt={w.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-primary/20">
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
            <SectionTitle title="실제 이용 후기" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {reviews.map((r) => (
                <Link
                  key={r.id}
                  href={`/companies/${r.company.id}`}
                  className="flex flex-col gap-2.5 rounded-2xl border border-primary/15 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-primary/25 dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {maskName(r.user.name).slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {maskName(r.user.name)} 님
                      </p>
                      <p className="truncate text-[11px] text-neutral-400">{r.company.name}</p>
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-1 text-accent">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3" fill={i < r.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="line-clamp-3 flex-1 text-sm text-neutral-700 dark:text-neutral-300">
                    {r.content}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 서비스 신뢰 요소 — 흰 카드가 이어지는 본문 끝에 네이비 톤을 한 번
          눌러줘서 Hero의 네이비와 위아래로 호응하게 만드는 지점. */}
      <section className="bg-primary px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-primary-foreground">{s.title}</p>
                <p className="text-xs text-primary-foreground/70">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
