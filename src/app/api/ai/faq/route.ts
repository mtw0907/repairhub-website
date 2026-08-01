import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 음향기기/악기 수리업체를 위한 FAQ 작성 도우미입니다. 업체가 알려준
주제나 자주 받는 질문 소재를 바탕으로, 고객이 궁금해할 만한 질문과 답변을 4~6개 쌍으로 한국어로
작성하세요. "Q: ... / A: ..." 형식으로 작성하세요.`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "topic이 필요합니다." }, { status: 400 });
    }

    const result = await runAiCompletion({
      type: "FAQ",
      system: SYSTEM_PROMPT,
      user: topic,
      userId: user.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
