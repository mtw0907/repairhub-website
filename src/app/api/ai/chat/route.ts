import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const USER_SYSTEM_PROMPT = `당신은 소리수리의 AI 상담원입니다. 음향기기 및 악기 수리에 관한
사용자의 질문에 친절하고 간결하게 한국어로 답변하세요. 플랫폼 이용 방법(검색, 예약, 견적 요청 등)에
대한 질문에도 답변할 수 있습니다.`;

const PARTNER_SYSTEM_PROMPT = `당신은 소리수리에 입점한 수리업체 사장님을 돕는 AI 상담원입니다.
고객 응대 문구 작성, 업체 운영 관련 질문에 대해 친절하고 실용적으로 한국어로 답변하세요.`;

export async function POST(req: Request) {
  try {
    const { message, history, mode } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "message가 필요합니다." }, { status: 400 });
    }

    const isPartner = mode === "partner";
    const user = await requireRole(isPartner ? ["PARTNER"] : ["USER"]);

    const conversation = Array.isArray(history)
      ? history
          .slice(-10)
          .map((h: { role: string; content: string }) => `${h.role === "user" ? "사용자" : "AI"}: ${h.content}`)
          .join("\n")
      : "";

    const userPrompt = conversation
      ? `이전 대화:\n${conversation}\n\n사용자: ${message}`
      : message;

    const result = await runAiCompletion({
      type: isPartner ? "CUSTOMER_CHAT" : "CHATBOT",
      system: isPartner ? PARTNER_SYSTEM_PROMPT : USER_SYSTEM_PROMPT,
      user: userPrompt,
      userId: user.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
