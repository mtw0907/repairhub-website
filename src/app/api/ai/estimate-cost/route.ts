import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 음향기기 및 악기 수리 비용을 대략적으로 안내하는 도우미입니다.
사용자가 설명하는 수리 내용을 바탕으로 한국 기준 예상 비용 범위(원)를 제시하고, 비용에 영향을
주는 요인을 간단히 설명하세요. 마지막에는 반드시 "실제 비용은 업체 방문 후 정확한 견적을 받아보세요."
라는 문구를 포함하세요. 한국어로 간결하게 답변하세요.`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { description } = await req.json();
    if (!description) {
      return NextResponse.json({ error: "description이 필요합니다." }, { status: 400 });
    }

    const result = await runAiCompletion({
      type: "COST_ESTIMATE",
      system: SYSTEM_PROMPT,
      user: description,
      userId: user.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
