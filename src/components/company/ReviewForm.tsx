"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ExistingReview = {
  id: string;
  rating: number;
  content: string;
  photos: string[];
};

export function ReviewForm({
  companyId,
  isUser,
  existingReview,
}: {
  companyId: string;
  isUser: boolean;
  existingReview?: ExistingReview;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [content, setContent] = useState(existingReview?.content ?? "");
  const [photos, setPhotos] = useState<string[]>(existingReview?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      setPhotos((prev) => [...prev, data.url]);
    } else {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "사진 업로드 중 오류가 발생했습니다.");
    }
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isUser) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    setMessage(null);

    const res = existingReview
      ? await fetch(`/api/reviews/${existingReview.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, content, photos }),
        })
      : await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, rating, content, photos }),
        });

    setSubmitting(false);
    if (res.ok) {
      setMessage(existingReview ? "후기가 수정되었습니다." : "후기가 등록되었습니다.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setMessage(data?.error ?? "후기 저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">평점</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </select>
      </div>

      <textarea
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="이용 후기를 남겨주세요"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          사진 첨부 (선택)
        </label>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        {photos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="첨부 사진" className="h-16 w-16 rounded object-cover" />
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
        {submitting ? "저장 중..." : existingReview ? "후기 수정" : "후기 등록"}
      </button>
    </form>
  );
}
