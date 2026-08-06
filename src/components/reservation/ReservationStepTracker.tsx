import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

export type StepState = "done" | "current" | "upcoming";

export type StepInfo = {
  label: string;
  icon: LucideIcon;
  date: string | null;
  state: StepState;
};

export function ReservationStepTracker({ steps }: { steps: StepInfo[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[640px] items-start justify-between sm:min-w-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-1 items-start">
            <div className="flex flex-col items-center gap-2 px-1 text-center">
              <span
                className={
                  step.state === "current"
                    ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15"
                    : step.state === "done"
                      ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                      : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-neutral-300 dark:bg-neutral-800 dark:text-neutral-600"
                }
              >
                {step.state === "done" ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </span>
              <div>
                <p
                  className={
                    step.state === "upcoming"
                      ? "text-xs font-medium text-neutral-400"
                      : "text-xs font-bold text-neutral-900 dark:text-neutral-100"
                  }
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">{step.date ?? "예정"}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={
                  step.state === "done"
                    ? "mt-6 h-0.5 flex-1 bg-primary/40"
                    : "mt-6 h-0.5 flex-1 border-t-2 border-dashed border-neutral-200 dark:border-neutral-700"
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
