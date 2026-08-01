import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 음향기기 및 악기 수리 전문가입니다. 사용자가 설명하는 증상을 바탕으로
가능성 있는 원인을 2~4가지로 정리하고, 각각에 대해 사용자가 직접 확인해볼 수 있는 간단한
점검 방법을 안내하세요. 마지막에는 반드시 "정확한 진단은 전문 수리업체 방문을 권장합니다."라는
문구를 포함하세요. 한국어로, 목록 형태로 간결하게 답변하세요.`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { symptom } = await req.json();
    if (!symptom) {
      return NextResponse.json({ error: "symptom이 필요합니다." }, { status: 400 });
    }

    const result = await runAiCompletion({
      type: "DIAGNOSIS",
      system: SYSTEM_PROMPT,
      user: symptom,
      userId: user.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
