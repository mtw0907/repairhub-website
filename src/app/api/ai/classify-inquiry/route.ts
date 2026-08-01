import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ForbiddenError } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 음향기기/악기 수리업체의 고객 문의를 분류하는 도우미입니다. 문의
내용을 보고 다음 카테고리 중 하나로 분류하고, 간단한 응대 팁을 1문장 덧붙이세요:
[가격 문의, 예약/일정 문의, A/S·품질 문의, 위치/방문 문의, 기타]

다음 형식으로 정확히 답변하세요:
분류: (카테고리명)
응대 팁: (1문장)`;

export async function POST(req: Request) {
  try {
    const partner = await requireRole(["PARTNER"]);
    const { inquiryId } = await req.json();
    if (!inquiryId) {
      return NextResponse.json({ error: "inquiryId가 필요합니다." }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry || inquiry.companyId !== partner.companyId) {
      throw new ForbiddenError();
    }

    const result = await runAiCompletion({
      type: "INQUIRY_CLASSIFY",
      system: SYSTEM_PROMPT,
      user: inquiry.message,
      userId: partner.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
