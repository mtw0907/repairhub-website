"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CompanyInfo = {
  name: string;
  ownerName: string;
  bizRegNo: string;
  address: string;
  region: string;
  phone: string;
  homepage: string;
  introduction: string;
  seoDescription: string;
  businessHours: string;
  closedDays: string;
  onSiteVisit: boolean;
  courierDrop: boolean;
};

export function CompanyInfoForm({ initial }: { initial: CompanyInfo }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  function set<K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerateSeo() {
    setGeneratingSeo(true);
    setMessage(null);
    const res = await fetch("/api/ai/seo-description", { method: "POST" });
    const data = await res.json().catch(() => null);
    setGeneratingSeo(false);
    if (res.ok) {
      set("seoDescription", data.result);
    } else {
      setMessage(data?.error ?? "SEO 설명 생성 중 오류가 발생했습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/partner/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("업체 정보가 저장되었습니다.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setMessage(
        typeof data?.error === "string" ? data.error : "저장 중 오류가 발생했습니다.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="업체명">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
        <Field label="대표자">
          <input
            value={form.ownerName}
            onChange={(e) => set("ownerName", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
        <Field label="사업자번호">
          <input
            value={form.bizRegNo}
            onChange={(e) => set("bizRegNo", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
        <Field label="연락처">
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
        <Field label="주소">
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
        <Field label="지역 (검색용, 예: 서울특별시 마포구)">
          <input
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
        <Field label="홈페이지">
          <input
            value={form.homepage}
            onChange={(e) => set("homepage", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
      </div>

      <Field label="업체 소개">
        <textarea
          value={form.introduction}
          onChange={(e) => set("introduction", e.target.value)}
          rows={4}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </Field>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            SEO 메타 설명 (검색 결과에 노출되는 문구)
          </label>
          <button
            type="button"
            onClick={handleGenerateSeo}
            disabled={generatingSeo}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {generatingSeo ? "생성 중..." : "AI로 생성"}
          </button>
        </div>
        <textarea
          value={form.seoDescription}
          onChange={(e) => set("seoDescription", e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="영업시간 (자유 기재)">
          <textarea
            value={form.businessHours}
            onChange={(e) => set("businessHours", e.target.value)}
            rows={3}
            placeholder="예: 평일 10:00-19:00 / 토 10:00-15:00"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
        <Field label="휴무일 (쉼표로 구분)">
          <input
            value={form.closedDays}
            onChange={(e) => set("closedDays", e.target.value)}
            placeholder="예: 일요일, 공휴일"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </Field>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.onSiteVisit}
            onChange={(e) => set("onSiteVisit", e.target.checked)}
          />
          출장 가능
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.courierDrop}
            onChange={(e) => set("courierDrop", e.target.checked)}
          />
          택배 가능
        </label>
      </div>

      {message && <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {loading ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      {children}
    </div>
  );
}
