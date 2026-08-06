"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Guitar, Speaker, ChevronLeft } from "lucide-react";
import { REPAIR_TARGETS } from "@/lib/constants";

type Category = "INSTRUMENT" | "AUDIO_EQUIPMENT";

export function NewRepairRequestForm({
  remaining,
  dailyLimit,
}: {
  remaining: number;
  dailyLimit: number;
}) {
  const router = useRouter();
  const limitReached = remaining <= 0;
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [instrument, setInstrument] = useState("");
  const [brand, setBrand] = useState("");
  const [symptom, setSymptom] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, kind: "photo" | "video") {
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
      if (kind === "photo") setPhotos((prev) => [...prev, data.url]);
      else setVideos((prev) => [...prev, data.url]);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "파일 업로드 중 오류가 발생했습니다.");
    }
    e.target.value = "";
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/repair-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, instrument, brand, symptom, photos, videos }),
    });
    const data = await res.json().catch(() => null);
    setSubmitting(false);
    if (res.ok) {
      router.push(`/dashboard/repair-requests/${data.id}`);
    } else {
      setError(data?.error ?? "AI 분석 요청 중 오류가 발생했습니다.");
    }
  }

  if (limitReached) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200/70 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          오늘의 AI 수리 견적 매칭 이용 횟수를 모두 사용했습니다.
        </p>
        <p className="text-sm text-neutral-500">
          하루 최대 {dailyLimit}회까지 이용 가능하며, 자정 이후 다시 이용하실 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        {[1, 2].map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={
                s <= step
                  ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                  : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-neutral-400"
              }
            >
              {s}
            </span>
            <span className={s <= step ? "text-sm font-semibold text-neutral-900 dark:text-neutral-100" : "text-sm text-neutral-400"}>
              {s === 1 ? "수리 대상 선택" : "증상 입력"}
            </span>
            {s === 1 && <span className="mx-2 h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.entries(REPAIR_TARGETS) as [Category, (typeof REPAIR_TARGETS)[Category]][]).map(
              ([key, group]) => {
                const Icon = key === "INSTRUMENT" ? Guitar : Speaker;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setCategory(key);
                      setInstrument("");
                    }}
                    className={
                      category === key
                        ? "flex items-center gap-3 rounded-xl border border-primary bg-primary/10 p-4 text-left transition-colors"
                        : "flex items-center gap-3 rounded-xl border border-neutral-200 p-4 text-left transition-colors hover:border-primary/30 dark:border-neutral-700"
                    }
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{group.label}</span>
                  </button>
                );
              },
            )}
          </div>

          {category && (
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                세부 종류
              </label>
              <div className="flex flex-wrap gap-2">
                {REPAIR_TARGETS[category].items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setInstrument(item)}
                    className={
                      instrument === item
                        ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                        : "rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-600 transition-colors hover:border-primary/40 dark:border-neutral-700 dark:text-neutral-300"
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              브랜드 (선택)
            </label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="예: Fender, Gibson, Yamaha"
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <button
            type="button"
            disabled={!category || !instrument}
            onClick={() => setStep(2)}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-40 disabled:hover:scale-100"
          >
            다음
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 p-5 sm:p-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            이전으로
          </button>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              고장 증상
            </label>
            <textarea
              required
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              rows={4}
              placeholder="예: 기타 앰프 연결하면 지직거리는 소리가 납니다."
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                사진 첨부 (선택)
              </label>
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "photo")} disabled={uploading} className="text-sm" />
              {photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {photos.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="증상 사진" className="h-16 w-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                영상 첨부 (선택)
              </label>
              <input type="file" accept="video/*" onChange={(e) => handleUpload(e, "video")} disabled={uploading} className="text-sm" />
              {videos.length > 0 && (
                <p className="mt-2 text-xs text-neutral-500">{videos.length}개 영상 첨부됨</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            disabled={!symptom || submitting || uploading}
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            {submitting ? "AI 분석 중..." : "AI 분석 시작하기"}
          </button>
        </div>
      )}
    </div>
  );
}
