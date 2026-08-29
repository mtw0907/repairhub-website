"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectMenu } from "@/components/ui/SelectMenu";
import type { CategoryTreeNode } from "@/lib/categories";

export type DeviceFormValues = {
  id?: string;
  name: string;
  categoryId: string | null;
  brand: string;
  model: string;
  photoUrl: string | null;
  memo: string;
};

export const EMPTY_DEVICE: DeviceFormValues = {
  name: "",
  categoryId: null,
  brand: "",
  model: "",
  photoUrl: null,
  memo: "",
};

export function DeviceForm({
  categoryTree,
  initial,
  onSaved,
  onCancel,
}: {
  categoryTree: CategoryTreeNode[];
  initial?: DeviceFormValues;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<DeviceFormValues>(initial ?? EMPTY_DEVICE);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = categoryTree.flatMap((top) =>
    top.children.map((c) => ({ value: c.id, label: `${top.name} · ${c.name}` })),
  );

  function set<K extends keyof DeviceFormValues>(key: K, value: DeviceFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      set("photoUrl", data.url);
    } else {
      setError("사진 업로드 중 오류가 발생했습니다.");
    }
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("장비 이름을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    const url = form.id ? `/api/user-devices/${form.id}` : "/api/user-devices";
    const method = form.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.refresh();
      onSaved?.();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          장비 이름
        </label>
        <input
          autoFocus
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="예: 내 기타, 작업용 카메라"
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          종류 (선택)
        </label>
        <SelectMenu
          placeholder="종류 선택"
          value={form.categoryId ?? ""}
          onChange={(v) => set("categoryId", v || null)}
          options={[{ value: "", label: "선택 안 함" }, ...categoryOptions]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            브랜드 (선택)
          </label>
          <input
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="예: Fender"
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            모델명 (선택)
          </label>
          <input
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            placeholder="예: Stratocaster"
            className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          사진 (선택)
        </label>
        <div className="flex items-center gap-3">
          {form.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photoUrl} alt="장비 사진" className="h-14 w-14 rounded-xl object-cover" />
          )}
          <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} className="text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          메모 (선택)
        </label>
        <textarea
          value={form.memo}
          onChange={(e) => set("memo", e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? "저장 중..." : form.id ? "수정하기" : "장비 등록하기"}
        </button>
      </div>
    </form>
  );
}
