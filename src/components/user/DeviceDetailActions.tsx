"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Trash2 } from "lucide-react";
import { DeviceForm, type DeviceFormValues } from "@/components/user/DeviceForm";
import { Card } from "@/components/ui/Card";
import type { CategoryTreeNode } from "@/lib/categories";

export function DeviceDetailActions({
  device,
  categoryTree,
}: {
  device: DeviceFormValues;
  categoryTree: CategoryTreeNode[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("이 장비를 삭제할까요? 등록된 이력은 그대로 남아있어요.")) return;
    setDeleting(true);
    const res = await fetch(`/api/user-devices/${device.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/dashboard/devices");
      router.refresh();
    }
  }

  if (editing) {
    return (
      <Card className="p-5">
        <DeviceForm categoryTree={categoryTree} initial={device} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      </Card>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-accent/50 hover:text-accent dark:border-neutral-700 dark:text-neutral-300"
      >
        <PenLine className="h-3.5 w-3.5" />
        수정
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50 dark:border-neutral-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
        삭제
      </button>
    </div>
  );
}
