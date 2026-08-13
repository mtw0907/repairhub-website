import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 악기 및 음향기기 고장 진단 전문가입니다. 사용자가 입력한 종류/브랜드/증상을 보고,
정확한 진단을 위해 꼭 필요한 추가 질문을 최대 2개까지 한국어로 만드세요. 이미 증상이 충분히
구체적이어서 추가 질문이 필요 없다면 빈 배열을 반환하세요. 질문은 사용자가 답하기 쉽게 짧고
구체적으로 작성하세요 (예: "어떤 상황에서 소리가 이상한가요? (특정 건반/줄, 특정 음량 등)").
반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"questions":["질문1","질문2"]}`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { category, instrument, brand, symptom } = await req.json();

    if (!category || !instrument || !symptom) {
      return NextResponse.json(
        { error: "category, instrument, symptom은 필수입니다." },
        { status: 400 },
      );
    }

    const userPrompt = `종류: ${instrument}${brand ? `\n브랜드: ${brand}` : ""}\n증상: ${symptom}`;

    const raw = await runAiCompletion({
      type: "REPAIR_MATCH_CLARIFY",
      system: SYSTEM_PROMPT,
      user: userPrompt,
      userId: user.id,
      json: true,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ questions: [] });
    }

    const questions =
      parsed && typeof parsed === "object" && Array.isArray((parsed as { questions?: unknown }).questions)
        ? (parsed as { questions: unknown[] }).questions
            .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
            .slice(0, 2)
        : [];

    return NextResponse.json({ questions });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
