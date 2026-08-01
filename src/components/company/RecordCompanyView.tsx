"use client";

import { useEffect } from "react";

// Fires only on actual client mount (not Link prefetch), for any visitor.
export function RecordCompanyView({ companyId }: { companyId: string }) {
  useEffect(() => {
    fetch(`/api/companies/${companyId}/view`, { method: "POST" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  return null;
}
