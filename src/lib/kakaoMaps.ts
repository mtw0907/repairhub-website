"use client";

import { useEffect, useState } from "react";

// The Kakao Maps JS SDK has no official types package in this project;
// components that touch `window.kakao` do so through this narrow surface.
declare global {
  interface Window {
    kakao: any;
  }
}

let loadingPromise: Promise<void> | null = null;

function loadKakaoMapsScript(appKey: string): Promise<void> {
  if (typeof window !== "undefined" && window.kakao?.maps) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=clusterer`;
    script.async = true;
    script.onload = () => {
      // A bad/unauthorized key can still return HTTP 200 with an error
      // payload that never defines window.kakao — onload fires regardless,
      // so re-check before calling into it.
      if (!window.kakao?.maps) {
        loadingPromise = null;
        reject(new Error("카카오맵 SDK 로드 실패 (키를 확인해주세요)"));
        return;
      }
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("카카오맵 SDK 로드 실패"));
    };
    document.head.appendChild(script);
  });
  return loadingPromise;
}

/** Loads the Kakao Maps SDK once (shared across all callers) and reports readiness/failure. */
export function useKakaoMapsLoaded(appKey: string | null): { loaded: boolean; error: boolean } {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!appKey) return;
    let cancelled = false;
    loadKakaoMapsScript(appKey)
      .then(() => {
        if (!cancelled) setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [appKey]);

  return { loaded, error };
}
