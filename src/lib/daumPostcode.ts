"use client";

// Daum(카카오) 우편번호 서비스 — 무료, API 키 불필요. 국내 대부분의 쇼핑몰/배송
// 서비스가 쓰는 것과 동일한 표준 주소 검색 위젯.
// https://postcode.map.daum.net
declare global {
  interface Window {
    daum: any;
  }
}

let loadingPromise: Promise<void> | null = null;

export function loadDaumPostcodeScript(): Promise<void> {
  if (typeof window !== "undefined" && window.daum?.Postcode) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("주소 검색 스크립트 로드 실패"));
    };
    document.head.appendChild(script);
  });
  return loadingPromise;
}
