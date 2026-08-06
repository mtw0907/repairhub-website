"use client";

import { useEffect, useRef, useState } from "react";
import { useKakaoMapsLoaded } from "@/lib/kakaoMaps";
import type { CompanySummary } from "@/components/company/CompanyCard";
import { CompanyFloatingCard } from "@/components/company/search/CompanyFloatingCard";
import type { MapBounds } from "@/components/company/search/types";

const CLUSTER_PIXEL_RADIUS = 44;

function createPinElement(
  company: CompanySummary,
  isSelected: boolean,
  onSelect: (id: string) => void,
): HTMLDivElement {
  const isAi = !!(company.aiRecommendReasons && company.aiRecommendReasons.length > 0);
  const bgClass = isAi ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground";
  const ringClass = isSelected ? "ring-4 ring-primary/30 scale-110" : "";
  const rating = company.avgRating ? company.avgRating.toFixed(1) : "-";

  const el = document.createElement("div");
  el.style.transform = "translate(-50%, -100%)";
  el.style.position = "relative";
  el.innerHTML = `
    <div class="flex flex-col items-center cursor-pointer transition-transform">
      <div class="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg ${bgClass} ${ringClass}">
        <span>★</span><span>${rating}</span>
      </div>
      <div class="h-2 w-2 -mt-1 rotate-45 ${bgClass.split(" ")[0]}"></div>
    </div>
  `;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onSelect(company.id);
  });
  return el;
}

function createClusterElement(count: number, onClick: () => void): HTMLDivElement {
  const el = document.createElement("div");
  el.style.transform = "translate(-50%, -50%)";
  el.style.position = "relative";
  el.innerHTML = `
    <div class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-primary bg-white text-sm font-bold text-primary shadow-lg dark:bg-neutral-900">
      ${count}
    </div>
  `;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return el;
}

export function CompanyMapView({
  companies,
  selectedId,
  onSelect,
  onBoundsChanged,
  center,
  zoomLevel,
  onZoomLevelChange,
  kakaoMapKey,
}: {
  companies: CompanySummary[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onBoundsChanged: (bounds: MapBounds) => void;
  center: { lat: number; lng: number };
  zoomLevel: number;
  onZoomLevelChange: (level: number) => void;
  kakaoMapKey: string | null;
}) {
  const { loaded, error: loadError } = useKakaoMapsLoaded(kakaoMapKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);

  const selectedCompany = companies.find((c) => c.id === selectedId) ?? null;

  // Create the map once the SDK is loaded.
  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current || !window.kakao?.maps) return;
    const kakao = window.kakao;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: zoomLevel,
    });
    mapRef.current = map;

    kakao.maps.event.addListener(map, "idle", () => {
      const bounds = map.getBounds();
      onBoundsChanged({
        sw: { lat: bounds.getSouthWest().getLat(), lng: bounds.getSouthWest().getLng() },
        ne: { lat: bounds.getNorthEast().getLat(), lng: bounds.getNorthEast().getLng() },
      });
      onZoomLevelChange(map.getLevel());
      rebuildOverlays();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Re-center/re-zoom when controlled from outside (locate button, zoom button).
  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setLevel(zoomLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel]);

  // Pan to the selected company's pin (list card click -> map).
  useEffect(() => {
    if (!mapRef.current || !window.kakao || !selectedCompany) return;
    if (selectedCompany.lat == null || selectedCompany.lng == null) return;
    mapRef.current.panTo(new window.kakao.maps.LatLng(selectedCompany.lat, selectedCompany.lng));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function rebuildOverlays() {
    const kakao = window.kakao;
    const map = mapRef.current;
    if (!map || !kakao) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const projection = map.getProjection();
    const points = companies
      .filter((c) => c.lat != null && c.lng != null)
      .map((c) => {
        const latlng = new kakao.maps.LatLng(c.lat, c.lng);
        const px = projection.containerPointFromCoords(latlng);
        return { company: c, latlng, px };
      });

    const used = new Set<number>();
    for (let i = 0; i < points.length; i++) {
      if (used.has(i)) continue;
      const group = [points[i]];
      used.add(i);
      for (let j = i + 1; j < points.length; j++) {
        if (used.has(j)) continue;
        const dx = points[i].px.x - points[j].px.x;
        const dy = points[i].px.y - points[j].px.y;
        if (Math.sqrt(dx * dx + dy * dy) < CLUSTER_PIXEL_RADIUS) {
          group.push(points[j]);
          used.add(j);
        }
      }

      if (group.length === 1) {
        const { company, latlng } = group[0];
        const overlay = new kakao.maps.CustomOverlay({
          position: latlng,
          content: createPinElement(company, company.id === selectedId, onSelect),
          yAnchor: 1,
          zIndex: company.id === selectedId ? 10 : 1,
        });
        overlay.setMap(map);
        overlaysRef.current.push(overlay);
      } else {
        const avgLat = group.reduce((s, p) => s + p.latlng.getLat(), 0) / group.length;
        const avgLng = group.reduce((s, p) => s + p.latlng.getLng(), 0) / group.length;
        const clusterCenter = new kakao.maps.LatLng(avgLat, avgLng);
        const overlay = new kakao.maps.CustomOverlay({
          position: clusterCenter,
          content: createClusterElement(group.length, () => {
            map.setCenter(clusterCenter);
            map.setLevel(Math.max(map.getLevel() - 2, 1));
          }),
          zIndex: 5,
        });
        overlay.setMap(map);
        overlaysRef.current.push(overlay);
      }
    }
  }

  useEffect(() => {
    if (!mapRef.current) return;
    rebuildOverlays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, selectedId, loaded]);

  if (!kakaoMapKey) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-muted p-6 text-center">
        <p className="text-sm font-medium text-neutral-500">지도를 표시할 수 없습니다</p>
        <p className="text-xs text-neutral-400">
          관리자가 시스템 설정에서 Kakao Maps JavaScript 키를 등록하면 지도가 나타납니다.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-muted p-6 text-center">
        <p className="text-sm font-medium text-neutral-500">지도를 불러오지 못했습니다</p>
        <p className="text-xs text-neutral-400">
          Kakao Maps 키가 올바른지, 이 도메인이 카카오 개발자 콘솔에 등록돼 있는지 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
          <p className="text-sm text-neutral-400">지도를 불러오는 중...</p>
        </div>
      )}
      {selectedCompany && (
        <div className="absolute bottom-4 right-4 z-10">
          <CompanyFloatingCard company={selectedCompany} onClose={() => onSelect(null)} />
        </div>
      )}
    </div>
  );
}
