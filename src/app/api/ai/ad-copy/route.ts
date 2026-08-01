import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 음향기기/악기 수리업체의 광고 문구를 작성하는 카피라이터입니다.
업체가 알려준 강점/포인트를 바탕으로 짧고 임팩트 있는 광고 문구를 3가지 스타일(친근한 톤,
전문적인 톤, 임팩트 있는 톤)로 각각 1~2문장씩 한국어로 작성하세요.`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    const { points } = await req.json();
    if (!points) {
      return NextResponse.json({ error: "points가 필요합니다." }, { status: 400 });
    }

    const result = await runAiCompletion({
      type: "AD_COPY",
      system: SYSTEM_PROMPT,
      user: points,
      userId: user.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
