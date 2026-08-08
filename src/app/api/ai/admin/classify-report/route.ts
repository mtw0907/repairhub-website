import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 소리수리 플랫폼의 신고 분류 담당자입니다. 신고 사유와 신고 대상
내용을 검토하고 다음 형식으로 정확히 답변하세요:

긴급도: (높음/중간/낮음)
신고 타당성: (타당함/불명확/근거부족)
권장 조치: 1~2문장

한국어로 간결하게 답변하세요.`;

export async function POST(req: Request) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const { reportId } = await req.json();
    if (!reportId) {
      return NextResponse.json({ error: "reportId가 필요합니다." }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { review: true },
    });
    if (!report) {
      return NextResponse.json({ error: "신고를 찾을 수 없습니다." }, { status: 404 });
    }

    let targetContent = "(대상 내용을 확인할 수 없음)";
    if (report.targetType === "REVIEW" && report.review) {
      targetContent = `후기 (별점 ${report.review.rating}/5): ${report.review.content}`;
    } else if (report.targetType === "COMPANY") {
      const company = await prisma.company.findUnique({ where: { id: report.targetId } });
      if (company) targetContent = `업체 소개: ${company.introduction ?? "(소개 없음)"}`;
    }

    const userPrompt = `신고 유형: ${report.targetType}\n신고 사유: ${report.reason}\n\n신고 대상 내용:\n${targetContent}`;

    const result = await runAiCompletion({
      type: "REPORT_CLASSIFY",
      system: SYSTEM_PROMPT,
      user: userPrompt,
      userId: admin.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
