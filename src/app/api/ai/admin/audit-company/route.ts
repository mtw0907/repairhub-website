import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 RepairHub 플랫폼의 업체 등록 검수 및 품질 평가 담당자입니다.
주어진 업체 데이터를 보고 다음 형식으로 정확히 답변하세요:

점수: NN/100
검수 의견: (프로필 완성도, 후기 신뢰도, 응답률을 근거로 2~3문장. 문제가 있다면 구체적으로 지적하고,
없다면 승인해도 좋다고 답변)

점수는 프로필 완성도(소개/사진/가격표/영업시간 등록 여부), 후기 평점과 개수, 견적 응답률을
종합해 매기세요. 한국어로 간결하게 답변하세요.`;

export async function POST(req: Request) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const { companyId } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: "companyId가 필요합니다." }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        services: true,
        priceItems: true,
        reviews: { where: { status: "VISIBLE" }, select: { rating: true } },
        estimates: { select: { status: true } },
      },
    });
    if (!company) {
      return NextResponse.json({ error: "업체를 찾을 수 없습니다." }, { status: 404 });
    }

    const reviewCount = company.reviews.length;
    const avgRating =
      reviewCount > 0
        ? (company.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount).toFixed(1)
        : "없음";
    const estimateTotal = company.estimates.length;
    const estimateAnswered = company.estimates.filter((e) => e.status === "ANSWERED").length;
    const responseRate =
      estimateTotal > 0 ? `${Math.round((estimateAnswered / estimateTotal) * 100)}%` : "데이터 없음";

    const dataSummary = `업체명: ${company.name}
소개 등록 여부: ${company.introduction ? "있음" : "없음"}
사진 등록 여부: ${company.photos ? "있음" : "없음"}
로고 등록 여부: ${company.logoUrl ? "있음" : "없음"}
등록된 서비스 수: ${company.services.length}
등록된 가격표 수: ${company.priceItems.length}
영업시간 등록 여부: ${company.businessHours ? "있음" : "없음"}
후기 평점: ${avgRating} (${reviewCount}건)
견적 응답률: ${responseRate}
현재 상태: ${company.status}`;

    const result = await runAiCompletion({
      type: "MODERATION",
      system: SYSTEM_PROMPT,
      user: dataSummary,
      userId: admin.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
