import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

// 파트너가 체크박스로 고른 "수리 가능 카테고리" 전체 선택 상태를 한 번에
// 저장한다 (하나씩 add/delete가 아니라 diff 기반 벌크 반영 — 체크박스
// 트리 UX에 적합). src/components/partner/CategoryChecklist.tsx에서 호출.
export async function PUT(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const { categoryIds } = await req.json();
    if (!Array.isArray(categoryIds) || !categoryIds.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "categoryIds는 문자열 배열이어야 합니다." }, { status: 400 });
    }

    const nextIds = new Set(categoryIds);
    const current = await prisma.companyCategory.findMany({
      where: { companyId: user.companyId },
      select: { categoryId: true },
    });
    const currentIds = new Set(current.map((c) => c.categoryId));

    const toAdd = [...nextIds].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !nextIds.has(id));

    await prisma.$transaction([
      ...(toRemove.length > 0
        ? [
            prisma.companyCategory.deleteMany({
              where: { companyId: user.companyId, categoryId: { in: toRemove } },
            }),
          ]
        : []),
      ...(toAdd.length > 0
        ? [
            prisma.companyCategory.createMany({
              data: toAdd.map((categoryId) => ({ companyId: user.companyId!, categoryId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
