"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WorkCaseForm() {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      setPhotos((prev) => [...prev, data.url]);
    } else {
      setMessage("사진 업로드 중 오류가 발생했습니다.");
    }
    e.target.value = "";
  }

  async function handleGenerate() {
    if (!notes.trim()) return;
    setGenerating(true);
    setMessage(null);
    const res = await fetch("/api/ai/work-case-copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const data = await res.json().catch(() => null);
    setGenerating(false);
    if (res.ok) {
      setTitle(data.title);
      setContent(data.content);
      setSeoDescription(data.seoDescription);
    } else {
      setMessage(data?.error ?? "AI 생성 중 오류가 발생했습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const res = await fetch("/api/partner/work-cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, photos, seoMeta: seoDescription || undefined }),
    });
    setSubmitting(false);
    if (res.ok) {
      setNotes("");
      setTitle("");
      setContent("");
      setSeoDescription("");
      setPhotos([]);
      setMessage("작업사례가 등록되었습니다.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "등록 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          작업 메모 (AI 초안 생성용, 선택)
        </label>
        <div className="flex gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="예: 깁슨 레스폴, 넥 각도 문제로 리셋 작업, 3시간 소요"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !notes.trim()}
            className="whitespace-nowrap rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {generating ? "생성 중..." : "AI로 제목/내용/SEO 생성"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="작업 내용을 설명해주세요"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        {seoDescription && (
          <p className="rounded-md bg-neutral-50 p-2 text-xs text-neutral-500 dark:bg-neutral-800">
            SEO 요약: {seoDescription}
          </p>
        )}
        <div>
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          {photos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="작업사례 사진" className="h-16 w-16 rounded object-cover" />
              ))}
            </div>
          )}
        </div>
        {message && <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {submitting ? "등록 중..." : "작업사례 등록"}
        </button>
      </form>
    </div>
  );
}
