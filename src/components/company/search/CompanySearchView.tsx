"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Scale, X } from "lucide-react";
import type { CompanySummary } from "@/components/company/CompanyCard";
import { SearchBar } from "@/components/company/search/SearchBar";
import { CategoryPills } from "@/components/company/search/CategoryPills";
import {
  FilterPanel,
  DEFAULT_FILTERS,
  countActiveFilters,
  type SearchFilters,
} from "@/components/company/search/FilterPanel";
import { CompanyListPanel } from "@/components/company/search/CompanyListPanel";
import { CompanyMapView } from "@/components/company/search/CompanyMapView";
import { MobileCompanySheet } from "@/components/company/search/MobileCompanySheet";
import { FilterSidebar } from "@/components/company/search/FilterSidebar";
import type { MapBounds, SortBy } from "@/components/company/search/types";
import { haversineDistanceKm, formatDistanceKm, DEFAULT_MAP_CENTER } from "@/lib/geo";
import type { CategoryTreeNode } from "@/lib/categories";

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function boundsContain(bounds: MapBounds | null, lat: number | null, lng: number | null): boolean {
  if (!bounds || lat == null || lng == null) return true;
  return lat >= bounds.sw.lat && lat <= bounds.ne.lat && lng >= bounds.sw.lng && lng <= bounds.ne.lng;
}

export function CompanySearchView({
  companies,
  favoritedIds,
  isUser,
  kakaoMapKey,
  initialKeyword = "",
  initialCategorySlug = null,
  categoryTree,
}: {
  companies: CompanySummary[];
  favoritedIds: string[];
  isUser: boolean;
  initialKeyword?: string;
  initialCategorySlug?: string | null;
  categoryTree: CategoryTreeNode[];
  kakaoMapKey: string | null;
}) {
  const isMobile = useIsMobile();

  const [keyword, setKeyword] = useState(initialKeyword);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    categorySlug: initialCategorySlug,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState(DEFAULT_MAP_CENTER);
  const [center, setCenter] = useState(DEFAULT_MAP_CENTER);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("recommended");

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setCenter(loc);
      },
      () => {},
      { timeout: 5000 },
    );
  }, []);

  const withDistance = useMemo(
    () =>
      companies.map((c) => {
        if (c.lat == null || c.lng == null) return c;
        const km = haversineDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
        return { ...c, distanceKm: km, distanceLabel: formatDistanceKm(km) };
      }),
    [companies, userLocation],
  );

  const searched = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const cat = activeCategory?.toLowerCase() ?? null;
    return withDistance.filter((c) => {
      const haystack = [c.name, c.introduction ?? "", ...c.services, ...c.brands, ...(c.categoryNames ?? [])]
        .join(" ")
        .toLowerCase();
      if (kw && !haystack.includes(kw)) return false;
      if (cat && !haystack.includes(cat)) return false;
      return true;
    });
  }, [withDistance, keyword, activeCategory]);

  const filtered = useMemo(() => {
    return searched.filter((c) => {
      if (filters.minRating !== null && (c.avgRating ?? 0) < filters.minRating) return false;
      if (filters.regionSido) {
        const regionMatch = filters.regionDistrict || filters.regionSido;
        if (!(c.region ?? "").includes(regionMatch)) return false;
      }
      if (filters.categorySlug && !(c.categorySlugs ?? []).includes(filters.categorySlug)) return false;
      if (filters.onSiteOnly && !c.onSiteVisit) return false;
      if (filters.courierOnly && !c.courierDrop) return false;
      if (filters.availableTodayOnly && !(c.todaySlots && c.todaySlots.length > 0)) return false;
      if (filters.openNowOnly && c.openStatus?.status !== "OPEN") return false;
      if (filters.aiRecommendOnly && !(c.aiRecommendReasons && c.aiRecommendReasons.length > 0))
        return false;
      return true;
    });
  }, [searched, filters]);

  const visibleInList = useMemo(
    () => filtered.filter((c) => boundsContain(bounds, c.lat ?? null, c.lng ?? null)),
    [filtered, bounds],
  );

  const sortedList = useMemo(() => {
    const arr = [...visibleInList] as (CompanySummary & { distanceKm?: number })[];
    switch (sortBy) {
      case "distance":
        arr.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
        break;
      case "rating":
        arr.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
        break;
      case "reviews":
        arr.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }
    return arr;
  }, [visibleInList, sortBy]);

  const aiCount = useMemo(
    () => filtered.filter((c) => c.aiRecommendReasons && c.aiRecommendReasons.length > 0).length,
    [filtered],
  );

  function toggleCompare(id: string) {
    setCompareSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  }

  function handleLocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(loc);
      setCenter(loc);
    });
  }

  const mapView = (
    <CompanyMapView
      companies={filtered}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onBoundsChanged={setBounds}
      center={center}
      zoomLevel={zoomLevel}
      onZoomLevelChange={setZoomLevel}
      kakaoMapKey={kakaoMapKey}
    />
  );

  const listPanel = (
    <CompanyListPanel
      companies={sortedList}
      favoritedIds={favoritedIds}
      isUser={isUser}
      selectedId={selectedId}
      onSelect={setSelectedId}
      selectedIds={compareSelected}
      onToggleCompare={toggleCompare}
      sortBy={sortBy}
      onSortChange={setSortBy}
      aiCount={aiCount}
      onShowAiOnly={() => setFilters((f) => ({ ...f, aiRecommendOnly: true }))}
    />
  );

  return (
    <div className="relative space-y-4">
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        onLocate={handleLocate}
        onOpenFilters={() => setFiltersOpen(true)}
        onZoomIn={() => setZoomLevel((z) => Math.max(z - 1, 1))}
        activeFilterCount={countActiveFilters(filters)}
      />
      <CategoryPills active={activeCategory} onChange={setActiveCategory} />

      {isMobile ? (
        <div className="relative -mx-4 h-[62vh] min-h-[380px] sm:hidden">
          {mapView}
          <MobileCompanySheet>{listPanel}</MobileCompanySheet>
        </div>
      ) : (
        <div className="hidden gap-4 sm:flex">
          {/* 왼쪽 25% 고정 필터 */}
          <div className="w-full max-w-[280px] shrink-0">
            <FilterSidebar filters={filters} onChange={setFilters} categoryTree={categoryTree} />
          </div>

          {/* 오른쪽 지도 + 업체 리스트 */}
          <div className="flex h-[70vh] min-h-[540px] flex-1 overflow-hidden rounded-3xl border border-neutral-200 shadow-sm dark:border-neutral-800">
            <div className="w-[38%] min-w-[300px] border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {listPanel}
            </div>
            <div className="min-h-0 flex-1">{mapView}</div>
          </div>
        </div>
      )}

      <FilterPanel
        open={filtersOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFiltersOpen(false)}
        categoryTree={categoryTree}
      />

      {compareSelected.length >= 2 && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6 sm:pb-8">
          <div className="compare-bar-enter flex w-full max-w-xl items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white/95 py-3 pl-5 pr-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95 sm:py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Scale className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {compareSelected.length}개 업체 선택됨
                </p>
                <button
                  type="button"
                  onClick={() => setCompareSelected([])}
                  className="flex items-center gap-0.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="h-3 w-3" />
                  선택 해제
                </button>
              </div>
            </div>
            <Link
              href={`/compare?ids=${compareSelected.join(",")}`}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-md transition-transform hover:scale-105 sm:px-6 sm:text-base"
            >
              비교하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
