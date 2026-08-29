"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Wrench, X } from "lucide-react";
import { DeviceForm } from "@/components/user/DeviceForm";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CategoryTreeNode } from "@/lib/categories";

export type DeviceListItem = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  photoUrl: string | null;
  categoryName: string | null;
};

export function DeviceListView({
  devices,
  categoryTree,
}: {
  devices: DeviceListItem[];
  categoryTree: CategoryTreeNode[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] hover:bg-primary/90"
        >
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {adding ? "닫기" : "장비 추가"}
        </button>
      </div>

      {adding && (
        <Card className="p-5">
          <DeviceForm categoryTree={categoryTree} onSaved={() => setAdding(false)} onCancel={() => setAdding(false)} />
        </Card>
      )}

      {devices.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {devices.map((d) => (
            <Link key={d.id} href={`/dashboard/devices/${d.id}`}>
              <Card hoverable className="flex items-center gap-4 p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
                  {d.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.photoUrl} alt={d.name} className="h-full w-full object-cover" />
                  ) : (
                    <Wrench className="h-6 w-6 text-primary/30" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-neutral-900 dark:text-neutral-100">{d.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {[d.categoryName, d.brand, d.model].filter(Boolean).join(" · ") || "정보 없음"}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        !adding && (
          <EmptyState
            icon={Wrench}
            title="등록된 장비가 없어요."
            description="내 장비를 등록하면 수리/예약/견적 이력을 한눈에 볼 수 있어요."
          />
        )
      )}
    </div>
  );
}
