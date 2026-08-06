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
  logoUrl: string;
  photos: string[];
};

export function CompanyInfoForm({ initial }: { initial: CompanyInfo }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  function set<K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "이미지 업로드 중 오류가 발생했습니다.");
      return null;
    }
    const data = await res.json();
    return data.url as string;
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setMessage(null);
    const url = await uploadFile(file);
    setUploadingLogo(false);
    if (url) set("logoUrl", url);
    e.target.value = "";
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setMessage(null);
    const url = await uploadFile(file);
    setUploadingPhoto(false);
    if (url) set("photos", [...form.photos, url]);
    e.target.value = "";
  }

  function removePhoto(url: string) {
    set(
      "photos",
      form.photos.filter((p) => p !== url),
    );
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
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          {form.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logoUrl} alt="업체 로고" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-neutral-400">로고 없음</span>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            로고
          </label>
          <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploadingLogo} />
          {uploadingLogo && <p className="mt-1 text-xs text-neutral-400">업로드 중...</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="업체명">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </Field>
        <Field label="대표자">
          <input
            value={form.ownerName}
            onChange={(e) => set("ownerName", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </Field>
        <Field label="사업자번호">
          <input
            value={form.bizRegNo}
            onChange={(e) => set("bizRegNo", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </Field>
        <Field label="연락처">
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </Field>
        <Field label="주소">
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </Field>
        <Field label="지역 (검색용, 예: 서울특별시 마포구)">
          <input
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </Field>
        <Field label="홈페이지">
          <input
            value={form.homepage}
            onChange={(e) => set("homepage", e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </Field>
      </div>

      <Field label="업체 소개">
        <textarea
          value={form.introduction}
          onChange={(e) => set("introduction", e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </Field>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          업체 사진
        </label>
        <div className="flex flex-wrap gap-2">
          {form.photos.map((url) => (
            <div key={url} className="group relative h-20 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="업체 사진" className="h-full w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground opacity-0 group-hover:opacity-100"
                aria-label="사진 삭제"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 text-xs text-neutral-400 transition-colors hover:bg-surface-muted dark:border-neutral-700 dark:hover:bg-neutral-800">
            {uploadingPhoto ? "업로드 중..." : "+ 추가"}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={uploadingPhoto}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            SEO 메타 설명 (검색 결과에 노출되는 문구)
          </label>
          <button
            type="button"
            onClick={handleGenerateSeo}
            disabled={generatingSeo}
            className="rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/20 disabled:opacity-50 dark:text-accent"
          >
            {generatingSeo ? "생성 중..." : "AI로 생성"}
          </button>
        </div>
        <textarea
          value={form.seoDescription}
          onChange={(e) => set("seoDescription", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="영업시간 (자유 기재)">
          <textarea
            value={form.businessHours}
            onChange={(e) => set("businessHours", e.target.value)}
            rows={3}
            placeholder="예: 평일 10:00-19:00 / 토 10:00-15:00"
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </Field>
        <Field label="휴무일 (쉼표로 구분)">
          <input
            value={form.closedDays}
            onChange={(e) => set("closedDays", e.target.value)}
            placeholder="예: 일요일, 공휴일"
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
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
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
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
