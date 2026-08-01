import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 음향기기/악기 수리업체의 작업사례 콘텐츠를 다듬는 편집자입니다.
업체가 적은 메모를 바탕으로 반드시 다음 JSON 형식으로만 응답하세요:
{"title": "제목", "content": "본문(2~4문단)", "seoDescription": "검색엔진용 요약 (100자 이내)"}
한국어로 작성하고, JSON 이외의 텍스트는 절대 포함하지 마세요.`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { notes } = await req.json();
    if (!notes) {
      return NextResponse.json({ error: "notes가 필요합니다." }, { status: 400 });
    }

    const raw = await runAiCompletion({
      type: "WORK_CASE",
      system: SYSTEM_PROMPT,
      user: notes,
      userId: user.id,
      json: true,
    });

    let parsed: { title?: string; content?: string; seoDescription?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI 응답을 해석하지 못했습니다. 다시 시도해주세요." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      title: parsed.title ?? "",
      content: parsed.content ?? "",
      seoDescription: parsed.seoDescription ?? "",
    });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
