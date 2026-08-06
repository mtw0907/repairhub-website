"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewCompanyForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    bizRegNo: "",
    address: "",
    region: "",
    phone: "",
    homepage: "",
    introduction: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const company = await res.json();
      router.push(`/admin/dashboard/companies?keyword=${encodeURIComponent(company.name)}`);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "등록 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="업체명 *">
          <input
            required
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
        <Field label="지역">
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
      <Field label="소개">
        <textarea
          value={form.introduction}
          onChange={(e) => set("introduction", e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "등록 중..." : "업체 등록 (미인증 상태로 생성)"}
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
