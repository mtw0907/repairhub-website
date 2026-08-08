import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 소리수리 플랫폼의 운영 분석가입니다. 아래 현재 운영 지표를 바탕으로
간단한 운영 리포트를 작성하세요. 다음 구조로 한국어로 작성하세요:

1. 요약 (2~3문장)
2. 주목할 점 (긍정적/우려되는 지표 각각 1~2개)
3. 제안 사항 (실행 가능한 액션 2~3개)

숫자가 적더라도 있는 그대로 분석하고, 데이터에 없는 내용은 추측하지 마세요.`;

export async function POST() {
  try {
    const admin = await requireRole(["ADMIN"]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      userCount,
      partnerCount,
      companyCount,
      pendingCompanies,
      reservationCount,
      todayReservations,
      reviewCount,
      pendingReports,
      estimateTotal,
      estimateAnswered,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "PARTNER" } }),
      prisma.company.count(),
      prisma.company.count({ where: { status: { in: ["PENDING", "UNVERIFIED"] } } }),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.review.count({ where: { status: "VISIBLE" } }),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.estimate.count(),
      prisma.estimate.count({ where: { status: "ANSWERED" } }),
    ]);

    const dataSummary = `일반 사용자 수: ${userCount}
업체(파트너) 수: ${partnerCount}
등록된 업체 페이지 수: ${companyCount} (승인 대기 ${pendingCompanies})
총 예약 수: ${reservationCount} (오늘 신규 ${todayReservations})
공개 후기 수: ${reviewCount}
처리 대기 신고: ${pendingReports}
견적 요청 수: ${estimateTotal} (답변 완료 ${estimateAnswered})`;

    const result = await runAiCompletion({
      type: "OPS_REPORT",
      system: SYSTEM_PROMPT,
      user: dataSummary,
      userId: admin.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
