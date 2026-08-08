import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Truck,
  Calendar,
  Wrench,
  ClipboardCheck,
  Star,
  MapPin,
  FileEdit,
  Banknote,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Bell,
  Store,
  Package,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserPageHeader } from "@/components/UserPageHeader";
import { ReservationStepTracker, type StepInfo } from "@/components/reservation/ReservationStepTracker";
import { NotifyToggle } from "@/components/reservation/NotifyToggle";
import { RESERVATION_METHOD_LABEL, type ReservationMethod } from "@/lib/constants";
import { formatBusinessHours } from "@/lib/businessHours";

const METHOD_ICON: Record<ReservationMethod, typeof Store> = {
  VISIT: Store,
  ONSITE: Truck,
  COURIER: Package,
};

const STEP_ORDER = ["REQUESTED", "APPROVED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"] as const;
const STEP_DEFS = [
  { status: "REQUESTED", label: "예약 접수", icon: FileText },
  { status: "APPROVED", label: "예약 승인", icon: Truck },
  { status: "CONFIRMED", label: "예약 확정", icon: Calendar },
  { status: "IN_PROGRESS", label: "수리 진행 중", icon: Wrench },
  { status: "COMPLETED", label: "수리 완료", icon: ClipboardCheck },
] as const;

function formatShort(date: Date) {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

const STATUS_MESSAGE: Record<string, string> = {
  REQUESTED: "예약 요청이 접수되었습니다. 업체 확인을 기다리고 있어요.",
  APPROVED: "예약이 승인되었습니다. 곧 방문 일정이 확정될 예정이에요.",
  CONFIRMED: "예약이 확정되었어요! 예약한 날짜와 시간에 방문해 주세요. 변경이 필요하시면 업체와 채팅으로 문의해 주세요.",
  IN_PROGRESS: "수리가 진행 중입니다. 완료되면 알려드릴게요.",
  COMPLETED: "수리가 완료되었습니다! 이용 후기를 남겨주시면 다른 분들에게 큰 도움이 돼요.",
  CHANGED: "예약 일정이 변경되었습니다. 내용을 확인해 주세요.",
  CANCELED: "이 예약은 취소되었습니다.",
  NO_SHOW: "노쇼로 처리된 예약입니다.",
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      company: {
        include: { reviews: { where: { status: "VISIBLE" }, select: { rating: true } } },
      },
      quote: true,
      statusLogs: true,
    },
  });

  if (!reservation || reservation.userId !== session!.user.id) {
    notFound();
  }

  const ownReview = await prisma.review.findFirst({
    where: { userId: session!.user.id, companyId: reservation.companyId },
  });

  const sortedLogs = [...reservation.statusLogs].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const firstSeen = new Map<string, Date>();
  for (const log of sortedLogs) {
    if (!firstSeen.has(log.status)) firstSeen.set(log.status, log.createdAt);
  }
  if (!firstSeen.has("REQUESTED")) firstSeen.set("REQUESTED", reservation.createdAt);

  let progressIndex = 0;
  STEP_ORDER.forEach((s, i) => {
    if (firstSeen.has(s)) progressIndex = i;
  });

  const steps: StepInfo[] = STEP_DEFS.map((def, i) => ({
    label: def.label,
    icon: def.icon,
    date: firstSeen.has(def.status) ? formatShort(firstSeen.get(def.status)!) : null,
    state: i < progressIndex ? "done" : i === progressIndex ? "current" : "upcoming",
  }));
  const reachedCompleted = progressIndex === STEP_DEFS.length - 1;
  const reviewedAfterCompletion =
    reachedCompleted && !!ownReview && ownReview.createdAt >= firstSeen.get("COMPLETED")!;
  steps.push({
    label: "후기 작성",
    icon: Star,
    date: reviewedAfterCompletion ? formatShort(ownReview!.createdAt) : null,
    state: !reachedCompleted ? "upcoming" : reviewedAfterCompletion ? "done" : "current",
  });

  const company = reservation.company;
  const reviewCount = company.reviews.length;
  const avgRating =
    reviewCount > 0 ? company.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;

  const mapQuery = encodeURIComponent(company.address ?? company.region ?? company.name);
  const businessHoursText = formatBusinessHours(company.businessHours, company.closedDays);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const isTerminalNegative = reservation.status === "CANCELED" || reservation.status === "NO_SHOW";

  return (
    <div className="min-h-full bg-surface-muted">
      <UserPageHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary dark:text-neutral-100">
          예약 진행 현황
        </h1>
        <p className="mt-1 text-sm text-neutral-500">현재 예약의 진행 상태를 한눈에 확인할 수 있습니다.</p>

        <div className="mt-6 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <ReservationStepTracker steps={steps} />

          <div
            className={
              isTerminalNegative
                ? "mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950"
                : "mt-6 flex items-start gap-3 rounded-xl bg-primary/5 p-4"
            }
          >
            <CheckCircle2
              className={isTerminalNegative ? "mt-0.5 h-5 w-5 shrink-0 text-red-500" : "mt-0.5 h-5 w-5 shrink-0 text-primary"}
            />
            <div className="min-w-0 flex-1">
              <p
                className={
                  isTerminalNegative
                    ? "text-sm font-semibold text-red-700 dark:text-red-300"
                    : "text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                }
              >
                {STATUS_MESSAGE[reservation.status] ?? reservation.status}
              </p>
            </div>
            <a
              href="#reservation-info"
              className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              상세 일정 확인
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div
            id="reservation-info"
            className="scroll-mt-6 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
          >
            <h2 className="mb-4 text-sm font-bold text-neutral-900 dark:text-neutral-100">예약 정보</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-neutral-500">
                  <FileText className="h-4 w-4 shrink-0" />
                  업체명
                </dt>
                <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                  <Link href={`/companies/${company.id}`} className="hover:text-primary hover:underline">
                    {company.name}
                  </Link>
                </dd>
              </div>
              {(() => {
                const method = (reservation.method || "VISIT") as ReservationMethod;
                const MethodIcon = METHOD_ICON[method] ?? Store;
                return (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-1.5 text-neutral-500">
                      <MethodIcon className="h-4 w-4 shrink-0" />
                      예약 방법
                    </dt>
                    <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {RESERVATION_METHOD_LABEL[method] ?? method}
                    </dd>
                  </div>
                );
              })()}
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-neutral-500">
                  <Calendar className="h-4 w-4 shrink-0" />
                  예약 날짜
                </dt>
                <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                  {reservation.scheduledAt
                    ? new Date(reservation.scheduledAt).toLocaleString("ko-KR")
                    : reservation.method === "COURIER"
                      ? "별도 방문 일정 없음"
                      : "희망 일시 미지정"}
                </dd>
              </div>
              {reservation.method === "ONSITE" && reservation.visitAddress ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-neutral-500">
                    <MapPin className="h-4 w-4 shrink-0" />
                    방문 받으실 주소
                  </dt>
                  <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                    <span className="truncate">{reservation.visitAddress}</span>
                  </dd>
                </div>
              ) : reservation.method === "COURIER" ? (
                reservation.visitAddress && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-1.5 text-neutral-500">
                      <MapPin className="h-4 w-4 shrink-0" />
                      반송 받으실 주소
                    </dt>
                    <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                      <span className="truncate">{reservation.visitAddress}</span>
                    </dd>
                  </div>
                )
              ) : (
                (company.address || company.region) && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-1.5 text-neutral-500">
                      <MapPin className="h-4 w-4 shrink-0" />
                      예약 장소
                    </dt>
                    <dd className="flex items-center gap-2 text-right font-medium text-neutral-900 dark:text-neutral-100">
                      <span className="truncate">{company.address ?? company.region}</span>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-lg border border-neutral-300 px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      >
                        지도 보기
                      </a>
                    </dd>
                  </div>
                )
              )}
              {reservation.memo && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-neutral-500">
                    <FileEdit className="h-4 w-4 shrink-0" />
                    예약 내용
                  </dt>
                  <dd className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                    {reservation.memo}
                  </dd>
                </div>
              )}
              {reservation.quote && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-neutral-500">
                    <Banknote className="h-4 w-4 shrink-0" />
                    견적 금액
                  </dt>
                  <dd className="flex items-center gap-2 text-right font-medium text-neutral-900 dark:text-neutral-100">
                    <span>{reservation.quote.price.toLocaleString()}원</span>
                    {reservation.repairRequestId && (
                      <Link
                        href={`/dashboard/repair-requests/${reservation.repairRequestId}`}
                        className="shrink-0 rounded-lg border border-neutral-300 px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      >
                        견적 상세 보기
                      </Link>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <h2 className="mb-4 text-sm font-bold text-neutral-900 dark:text-neutral-100">업체 정보</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted text-lg font-bold text-primary/40 dark:bg-neutral-800">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                ) : (
                  company.name.slice(0, 1)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-neutral-900 dark:text-neutral-100">{company.name}</p>
                <p className="flex items-center gap-1 text-xs text-neutral-500">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  {avgRating ? avgRating.toFixed(1) : "신규"}
                  {reviewCount > 0 && <span>(리뷰 {reviewCount}개)</span>}
                </p>
              </div>
              <Link
                href={`/companies/${company.id}`}
                className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary-foreground transition-transform hover:scale-105"
              >
                업체 바로가기
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href={`/companies/${company.id}#문의`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                <MessageCircle className="h-4 w-4" />
                업체에 문의하기
              </Link>
              {company.phone ? (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  <Phone className="h-4 w-4" />
                  전화하기
                </a>
              ) : (
                <span className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-300 dark:border-neutral-800">
                  <Phone className="h-4 w-4" />
                  전화하기
                </span>
              )}
            </div>

            {(businessHoursText || company.phone) && (
              <div className="mt-4 space-y-1 rounded-xl bg-surface-muted p-3 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {businessHoursText && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    영업시간: {businessHoursText}
                  </p>
                )}
                {company.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    연락처: {company.phone}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground dark:text-accent">
            <Bell className="h-4 w-4 shrink-0" />
            알림 설정 — 예약 관련 알림을 받아보세요.
          </div>
          <NotifyToggle reservationId={reservation.id} initialEnabled={reservation.notifyEnabled} />
        </div>
      </main>
    </div>
  );
}
