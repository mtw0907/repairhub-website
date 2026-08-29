import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

// 마이페이지 "내 장비" — 사용자가 등록한 장비 CRUD. 목록 조회는 각 페이지
// 서버 컴포넌트에서 Prisma로 직접 조회하는 기존 관례를 따르므로 GET은
// 없음 (src/app/(user)/dashboard/devices/page.tsx 참고).
export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { name, categoryId, brand, model, photoUrl, memo } = await req.json();

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "장비 이름을 입력해주세요." }, { status: 400 });
    }

    const device = await prisma.userDevice.create({
      data: {
        userId: user.id,
        name: String(name).trim(),
        categoryId: categoryId || null,
        brand: brand || null,
        model: model || null,
        photoUrl: photoUrl || null,
        memo: memo || null,
      },
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
