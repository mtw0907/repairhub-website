import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 음향기기/악기 수리업체 사장님을 대신해 고객 후기에 답글을 작성하는
도우미입니다. 후기 내용과 별점을 참고하여 진심 어리고 예의 바른 답글을 2~3문장으로 한국어로
작성하세요. 별점이 낮다면 사과와 개선 의지를 담고, 높다면 감사 인사를 담으세요.`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { reviewContent, rating } = await req.json();
    if (!reviewContent || typeof rating !== "number") {
      return NextResponse.json(
        { error: "reviewContent, rating이 필요합니다." },
        { status: 400 },
      );
    }

    const result = await runAiCompletion({
      type: "REVIEW_REPLY",
      system: SYSTEM_PROMPT,
      user: `별점: ${rating}/5\n후기 내용: ${reviewContent}`,
      userId: user.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
