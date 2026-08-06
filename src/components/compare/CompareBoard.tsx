"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Wrench,
  Tag,
  Receipt,
  Truck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  CalendarPlus,
} from "lucide-react";
import { FavoriteButton } from "@/components/company/FavoriteButton";

export type CompareCompany = {
  id: string;
  rank: number;
  name: string;
  region: string | null;
  photoUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  services: string[];
  brands: string[];
  priceItems: { id: string; label: string; price: number }[];
  onSiteVisit: boolean;
  courierDrop: boolean;
  favorited: boolean;
};

const ROW_ICON_CLASS = "h-4 w-4 shrink-0 text-[#2563EB]";

export function CompareBoard({
  companies,
  isUser,
}: {
  companies: CompareCompany[];
  isUser: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${companies.length}, minmax(200px, 1fr))` }}
      >
        {companies.map((c) => {
          const selected = c.id === selectedId;
          return (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(selected ? null : c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(selected ? null : c.id);
                }
              }}
              className={
                selected
                  ? "relative cursor-pointer rounded-2xl border-2 border-[#2563EB] bg-white p-4 text-left shadow-sm transition-shadow dark:bg-neutral-900"
                  : "relative cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              }
            >
              <span className="absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                {c.rank}
              </span>
              <span className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton companyId={c.id} initialFavorited={c.favorited} isUser={isUser} variant="icon" />
              </span>
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-surface-muted">
                {c.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photoUrl} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary/20">
                    {c.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <p className="mt-3 truncate text-base font-bold text-neutral-900 dark:text-neutral-100">
                {c.name}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm">
                <Star className={c.avgRating ? "h-4 w-4 fill-accent text-accent" : "h-4 w-4 text-neutral-300"} />
                {c.avgRating ? (
                  <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                    {c.avgRating.toFixed(1)} <span className="font-normal text-neutral-400">({c.reviewCount})</span>
                  </span>
                ) : (
                  <span className="text-neutral-400">후기 없음</span>
                )}
              </p>
              {c.region && (
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-neutral-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {c.region}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <CompareRow icon={<MapPin className={ROW_ICON_CLASS} />} label="지역">
          {companies.map((c) => (
            <CompareCell key={c.id}>{c.region ?? "-"}</CompareCell>
          ))}
        </CompareRow>
        <CompareRow icon={<Star className={ROW_ICON_CLASS} />} label="평점">
          {companies.map((c) => (
            <CompareCell key={c.id}>
              {c.avgRating ? (
                <span className="flex items-center gap-1 font-semibold text-neutral-800 dark:text-neutral-100">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {c.avgRating.toFixed(1)} <span className="font-normal text-neutral-400">({c.reviewCount})</span>
                </span>
              ) : (
                <span className="text-neutral-400">후기 없음</span>
              )}
            </CompareCell>
          ))}
        </CompareRow>
        <CompareRow icon={<Wrench className={ROW_ICON_CLASS} />} label="서비스">
          {companies.map((c) => (
            <CompareCell key={c.id}>{c.services.join(", ") || "-"}</CompareCell>
          ))}
        </CompareRow>
        <CompareRow icon={<Tag className={ROW_ICON_CLASS} />} label="취급 브랜드">
          {companies.map((c) => (
            <CompareCell key={c.id}>{c.brands.join(", ") || "-"}</CompareCell>
          ))}
        </CompareRow>
        <CompareRow icon={<Receipt className={ROW_ICON_CLASS} />} label="가격표">
          {companies.map((c) => (
            <CompareCell key={c.id}>
              {c.priceItems.length > 0 ? (
                <>
                  <ul className="space-y-1">
                    {c.priceItems.slice(0, 3).map((p) => (
                      <li key={p.id}>
                        {p.label}: {p.price.toLocaleString()}원
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/companies/${c.id}#가격표`}
                    className="mt-2 inline-block text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    가격표 더보기 &gt;
                  </Link>
                </>
              ) : (
                "-"
              )}
            </CompareCell>
          ))}
        </CompareRow>
        <CompareRow icon={<Truck className={ROW_ICON_CLASS} />} label="출장/택배">
          {companies.map((c) => (
            <CompareCell key={c.id}>
              <div className="space-y-1">
                <p className="flex items-center gap-1.5">
                  {c.onSiteVisit ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-neutral-300" />
                  )}
                  출장 {c.onSiteVisit ? "가능" : "불가"}
                </p>
                <p className="flex items-center gap-1.5">
                  {c.courierDrop ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-neutral-300" />
                  )}
                  택배 {c.courierDrop ? "가능" : "불가"}
                </p>
              </div>
            </CompareCell>
          ))}
        </CompareRow>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={selectedId ? `/companies/${selectedId}#문의` : "#"}
          aria-disabled={!selectedId}
          className={
            selectedId
              ? "flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2563EB] px-5 py-3 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#2563EB]/5"
              : "pointer-events-none flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-300 dark:border-neutral-800"
          }
        >
          <MessageCircle className="h-4 w-4" />
          선택 업체에 문의하기
        </Link>
        <Link
          href={selectedId ? `/companies/${selectedId}#예약` : "#"}
          aria-disabled={!selectedId}
          className={
            selectedId
              ? "flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01]"
              : "pointer-events-none flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-400 dark:bg-neutral-800"
          }
        >
          <CalendarPlus className="h-4 w-4" />
          선택 업체로 예약하기
        </Link>
      </div>
      <p className="mt-3 text-center text-xs text-neutral-400">
        {selectedId ? "카드를 다시 누르면 선택이 해제됩니다." : "비교할 업체 카드를 선택하면 문의·예약을 진행할 수 있습니다."} 최대 3개 업체까지 비교할 수 있습니다.
      </p>
    </div>
  );
}

function CompareRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] border-b border-neutral-100 last:border-b-0 dark:border-neutral-800 sm:grid-cols-[10rem_1fr]">
      <div className="flex items-center gap-2 bg-surface-muted px-4 py-4 text-sm font-semibold text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300">
        {icon}
        {label}
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Array.isArray(children) ? children.length : 1}, minmax(160px, 1fr))` }}
      >
        {children}
      </div>
    </div>
  );
}

function CompareCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l border-neutral-100 px-4 py-4 text-sm text-neutral-700 first:border-l-0 dark:border-neutral-800 dark:text-neutral-300">
      {children}
    </div>
  );
}
