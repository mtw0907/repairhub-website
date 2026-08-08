import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 소리수리 플랫폼의 후기 검수 및 스팸 탐지 담당자입니다. 주어진 후기
내용을 검토하고 다음 형식으로 정확히 답변하세요:

스팸 여부: (예/아니오)
부적절한 내용: (예/아니오 - 욕설, 광고, 개인정보 노출 등)
권장 조치: (공개 유지 / 숨김 검토 / 삭제 검토 중 하나와 짧은 이유)

한국어로 간결하게 답변하세요.`;

export async function POST(req: Request) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const { reviewId } = await req.json();
    if (!reviewId) {
      return NextResponse.json({ error: "reviewId가 필요합니다." }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "후기를 찾을 수 없습니다." }, { status: 404 });
    }

    const result = await runAiCompletion({
      type: "MODERATION",
      system: SYSTEM_PROMPT,
      user: `별점: ${review.rating}/5\n후기 내용: ${review.content}`,
      userId: admin.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
