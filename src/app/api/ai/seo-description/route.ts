import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 지역 서비스 업체를 위한 SEO 카피라이터입니다. 주어진 업체 정보를 바탕으로
검색엔진 노출에 최적화된 메타 설명을 100자 이내 한국어 한 문장으로 작성하세요. 업체명, 지역,
핵심 서비스를 자연스럽게 포함하세요. 따옴표나 설명 없이 문장만 답변하세요.`;

export async function POST() {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const company = await prisma.company.findUniqueOrThrow({
      where: { id: user.companyId },
      include: { services: true, brands: true },
    });

    const dataSummary = `업체명: ${company.name}
지역: ${company.region ?? "미상"}
소개: ${company.introduction ?? "없음"}
서비스: ${company.services.map((s) => s.name).join(", ") || "없음"}
브랜드: ${company.brands.map((b) => b.name).join(", ") || "없음"}`;

    const result = await runAiCompletion({
      type: "SEO",
      system: SYSTEM_PROMPT,
      user: dataSummary,
      userId: user.id,
    });

    return NextResponse.json({ result: result.trim() });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
