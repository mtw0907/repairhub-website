"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useKakaoMapsLoaded } from "@/lib/kakaoMaps";
import { DEFAULT_MAP_CENTER } from "@/lib/geo";

type MapCompany = { id: string; name: string; lat: number; lng: number };

function createPinElement(company: MapCompany, onSelect: (id: string) => void): HTMLDivElement {
  const el = document.createElement("div");
  el.style.transform = "translate(-50%, -100%)";
  el.style.position = "relative";
  el.innerHTML = `
    <div class="flex flex-col items-center cursor-pointer">
      <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div class="h-2 w-2 -mt-1 rotate-45 bg-primary"></div>
    </div>
  `;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onSelect(company.id);
  });
  return el;
}

/** Small, mostly-decorative map preview for the homepage — pans/click only, no search/filter UI. */
export function HomeMapPreview({
  companies,
  kakaoMapKey,
}: {
  companies: MapCompany[];
  kakaoMapKey: string | null;
}) {
  const router = useRouter();
  const { loaded, error: loadError } = useKakaoMapsLoaded(kakaoMapKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current || !window.kakao?.maps) return;
    const kakao = window.kakao;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng),
      level: 7,
    });
    mapRef.current = map;

    companies.forEach((company) => {
      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(company.lat, company.lng),
        content: createPinElement(company, (id) => router.push(`/companies/${id}`)),
        yAnchor: 1,
      });
      overlay.setMap(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (!kakaoMapKey) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-surface-muted p-6 text-center">
        <p className="text-sm font-medium text-neutral-500">지도를 표시할 수 없습니다</p>
        <p className="text-xs text-neutral-400">Kakao Maps 키가 등록되면 이곳에 표시됩니다.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-surface-muted p-6 text-center">
        <p className="text-sm font-medium text-neutral-500">지도를 불러오지 못했습니다</p>
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
    </div>
  );
}
