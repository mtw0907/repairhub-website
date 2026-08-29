import { AlertTriangle, Wrench, Coins, Tags } from "lucide-react";

export type AiAnalysisResult = {
  causes: { rank: number; label: string; description: string }[];
  priceMin: number;
  priceMax: number;
  specialties: string[];
};

export function AiAnalysisCard({ result }: { result: AiAnalysisResult }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm dark:border-primary/25 dark:bg-neutral-900">
      <div className="bg-gradient-to-r from-primary to-primary/85 px-5 py-4">
        <h2 className="text-base font-bold text-white">AI 분석 결과</h2>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            <Wrench className="h-4 w-4 text-accent" />
            예상 고장 원인
          </h3>
          <ul className="space-y-2">
            {result.causes.map((c) => (
              <li key={c.rank} className="flex gap-2 rounded-xl bg-surface-muted p-3 text-sm dark:bg-neutral-800">
                <span className="shrink-0 font-bold text-primary">{c.rank}순위</span>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">{c.label}</p>
                  <p className="text-neutral-500 dark:text-neutral-400">{c.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            <Coins className="h-4 w-4 text-accent" />
            예상 수리 비용
          </h3>
          <p className="text-lg font-bold text-primary">
            {result.priceMin.toLocaleString()}원 ~ {result.priceMax.toLocaleString()}원
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            AI 예상 비용이며, 실제 견적은 기기 상태와 업체에 따라 다를 수 있어요.
          </p>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
            <Tags className="h-4 w-4 text-accent" />
            추천 수리 분야
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {result.specialties.map((s) => (
              <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          AI 분석은 참고용이며, 실제 수리 여부·금액은 업체 점검 후 최종 결정됩니다.
        </div>
      </div>
    </div>
  );
}
