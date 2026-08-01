import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 음향기기/악기 수리업체의 블로그 콘텐츠를 작성하는 카피라이터입니다.
업체가 알려준 주제로, SEO에 도움이 되면서도 자연스러운 블로그 글을 한국어로 작성하세요.
제목과 본문(3~5개 문단)으로 구성하세요.`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "topic이 필요합니다." }, { status: 400 });
    }

    const result = await runAiCompletion({
      type: "BLOG",
      system: SYSTEM_PROMPT,
      user: topic,
      userId: user.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
