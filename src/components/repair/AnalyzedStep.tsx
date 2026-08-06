"use client";

import { useState } from "react";
import { MatchSettingsForm } from "@/components/repair/MatchSettingsForm";

export function AnalyzedStep({ repairRequestId }: { repairRequestId: string }) {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] hover:bg-primary/90"
      >
        수리 가능한 업체의 견적을 받아보시겠습니까?
      </button>
    );
  }

  return <MatchSettingsForm repairRequestId={repairRequestId} />;
}
