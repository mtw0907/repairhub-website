"use client";

import { useEffect } from "react";

// Fires only on an actual client mount (not on Next.js Link prefetch, which
// never executes client JS), so this won't inflate recent-view history.
export function RecordRecentView({ companyId }: { companyId: string }) {
  useEffect(() => {
    fetch("/api/recent-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    }).catch(() => {});
  }, [companyId]);

  return null;
}
