"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronLeft, HelpCircle } from "lucide-react";
import type { CategoryTreeNode } from "@/lib/categories";
import {
  CategoryInstrumentPicker,
  EMPTY_CATEGORY_SELECTION,
  type CategorySelection,
} from "@/components/repair/CategoryInstrumentPicker";
import { SelectMenu } from "@/components/ui/SelectMenu";

// 지시서 SECTION 8: 카테고리 → 세부장비 → 브랜드 → 모델명 → 증상 → 사진 →
// AI분석 7단계 위저드. 카테고리/세부장비는 CategoryInstrumentPicker 한
// 컴포넌트가 내부적으로 두 섹션을 갖고 있어, 화면상 스텝만 나눠서 보여준다
// (STEP 1에서는 대분류만, STEP 2에서는 같은 컴포넌트를 다시 그려 세부품목
// 섹션이 자연스럽게 이어지도록 함).
const STEP_LABELS = ["카테고리", "세부 장비", "브랜드", "모델명", "증상", "사진", "AI 분석"] as const;

export function NewRepairRequestForm({
  remaining,
  dailyLimit,
  categoryTree,
  devices = [],
}: {
  remaining: number;
  dailyLimit: number;
  categoryTree: CategoryTreeNode[];
  devices?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const limitReached = remaining <= 0;
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState<CategorySelection>(EMPTY_CATEGORY_SELECTION);
  const { categoryId, categoryName, subcategoryId, instrument } = selection;
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [symptom, setSymptom] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clarifyQuestions, setClarifyQuestions] = useState<string[]>([]);
  const [clarifyAnswers, setClarifyAnswers] = useState<string[]>([]);
  const [clarifyFetched, setClarifyFetched] = useState(false);
  const [clarifying, setClarifying] = useState(false);

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

  async function handleClarifyOrSubmit() {
    if (clarifyFetched) {
      handleSubmit();
      return;
    }
    setClarifying(true);
    setError(null);
    try {
      const res = await fetch("/api/repair-requests/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryName, instrument, brand, symptom }),
      });
      const data = await res.json().catch(() => null);
      const questions: string[] = Array.isArray(data?.questions) ? data.questions : [];
      setClarifyFetched(true);
      if (questions.length > 0) {
        setClarifyQuestions(questions);
        setClarifyAnswers(new Array(questions.length).fill(""));
        setClarifying(false);
      } else {
        setClarifying(false);
        handleSubmit();
      }
    } catch {
      // 확인 질문은 보조 기능이라, 실패해도 곧바로 분석으로 진행.
      setClarifyFetched(true);
      setClarifying(false);
      handleSubmit();
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const finalSymptom =
      clarifyQuestions.length > 0
        ? `${symptom}\n\n[추가 확인]\n${clarifyQuestions
            .map((q, i) => `Q. ${q}\nA. ${clarifyAnswers[i]?.trim() || "(답변 없음)"}`)
            .join("\n")}`
        : symptom;
    const res = await fetch("/api/repair-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: categoryName,
        instrument,
        categoryId,
        subcategoryId,
        brand,
        model,
        deviceId,
        symptom: finalSymptom,
        photos,
        videos,
      }),
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
          오늘의 AI 수리진단 이용 횟수를 모두 사용했습니다.
        </p>
        <p className="text-sm text-neutral-500">
          하루 최대 {dailyLimit}회까지 이용 가능하며, 자정 이후 다시 이용하실 수 있습니다.
        </p>
      </div>
    );
  }

  const canProceed =
    (step === 1 && !!categoryId) ||
    (step === 2 && !!instrument) ||
    step === 3 ||
    step === 4 ||
    (step === 5 && !!symptom) ||
    step === 6;

  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            return (
              <div key={label} className="flex flex-1 items-center gap-1 last:flex-none">
                <span
                  className={
                    n <= step
                      ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground"
                      : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-bold text-neutral-400"
                  }
                >
                  {n}
                </span>
                {n < STEP_LABELS.length && (
                  <span className={n < step ? "h-px flex-1 bg-primary" : "h-px flex-1 bg-neutral-200 dark:bg-neutral-800"} />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {step}단계 · {STEP_LABELS[step - 1]}
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-accent"
          >
            <ChevronLeft className="h-4 w-4" />
            이전으로
          </button>
        )}

        {step === 1 && (
          <>
            {devices.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  내 장비와 연결 (선택)
                </label>
                <SelectMenu
                  placeholder="연결 안 함"
                  value={deviceId ?? ""}
                  onChange={(v) => setDeviceId(v || null)}
                  options={[{ value: "", label: "연결 안 함" }, ...devices.map((d) => ({ value: d.id, label: d.name }))]}
                />
              </div>
            )}
            <CategoryInstrumentPicker tree={categoryTree} value={selection} onChange={setSelection} mode="category" />
          </>
        )}
        {step === 2 && (
          <CategoryInstrumentPicker tree={categoryTree} value={selection} onChange={setSelection} mode="subcategory" />
        )}

        {step === 3 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              브랜드 (선택)
            </label>
            <input
              autoFocus
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="예: Fender, Gibson, DJI, Sony"
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
        )}

        {step === 4 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              모델명 (선택)
            </label>
            <input
              autoFocus
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="예: Stratocaster, Mavic Air 2, A7M4"
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
        )}

        {step === 5 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              고장 증상
            </label>
            <textarea
              autoFocus
              required
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              rows={4}
              placeholder="예: 기타 앰프 연결하면 지직거리는 소리가 납니다."
              className="w-full rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
        )}

        {step === 6 && (
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
        )}

        {step === 7 && (
          <div className="space-y-5">
            <div className="rounded-xl bg-surface-muted p-4 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                {categoryName} · {instrument}
                {brand && ` · ${brand}`}
                {model && ` · ${model}`}
              </p>
              <p className="mt-1 whitespace-pre-line">{symptom}</p>
            </div>

            {clarifyQuestions.length > 0 && (
              <div className="space-y-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
                <p className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  <HelpCircle className="h-4 w-4 text-accent" />
                  더 정확한 분석을 위해 몇 가지 확인할게요
                </p>
                {clarifyQuestions.map((q, i) => (
                  <div key={q}>
                    <label className="mb-1 block text-sm text-neutral-700 dark:text-neutral-300">{q}</label>
                    <input
                      value={clarifyAnswers[i] ?? ""}
                      onChange={(e) =>
                        setClarifyAnswers((prev) => {
                          const next = [...prev];
                          next[i] = e.target.value;
                          return next;
                        })
                      }
                      placeholder="답변을 입력해주세요 (선택)"
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="button"
              disabled={submitting || uploading || clarifying}
              onClick={handleClarifyOrSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Sparkles className="h-4 w-4 text-accent" />
              {clarifying ? "확인할 내용 준비 중..." : submitting ? "AI 분석 중..." : "AI 분석 시작하기"}
            </button>
          </div>
        )}

        {step < 7 && (
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => setStep((s) => s + 1)}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90 disabled:opacity-40 disabled:hover:scale-100"
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}
