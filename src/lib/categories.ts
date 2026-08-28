import {
  Guitar,
  Speaker,
  Disc3,
  Camera,
  Video,
  Plane,
  Printer,
  Gamepad2,
  Tent,
  Package,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export type CategoryTreeNode = CategoryNode & { children: CategoryNode[] };

// Category.icon 문자열 → lucide 아이콘. prisma/seedCategories.ts의 top-level
// icon 값과 짝을 맞춘다. 매칭되는 아이콘이 없으면 Package로 대체.
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  guitar: Guitar,
  speaker: Speaker,
  disc3: Disc3,
  camera: Camera,
  video: Video,
  plane: Plane,
  printer: Printer,
  gamepad: Gamepad2,
  tent: Tent,
};

export function getCategoryIcon(icon: string | null | undefined): LucideIcon {
  if (!icon) return Package;
  return CATEGORY_ICON_MAP[icon] ?? Package;
}

// 활성 대분류 + 하위 세부 품목을 트리로 조회. 홈 화면, /categories, AI 견적
// 매칭, 업체 상세(예약 폼), 업체 검색, 파트너 프로필 편집이 전부 공용으로 쓴다.
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, icon: true, description: true, parentId: true },
  });

  const tops = categories.filter((c) => c.parentId === null);
  const childrenByParent = new Map<string, CategoryNode[]>();
  for (const c of categories) {
    if (c.parentId === null) continue;
    const list = childrenByParent.get(c.parentId) ?? [];
    list.push({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, description: c.description });
    childrenByParent.set(c.parentId, list);
  }

  return tops.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    icon: t.icon,
    description: t.description,
    children: childrenByParent.get(t.id) ?? [],
  }));
}
