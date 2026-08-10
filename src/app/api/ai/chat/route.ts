import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const USER_SYSTEM_PROMPT = `당신은 소리수리의 AI 상담원입니다. 친절하고 간결하게 한국어로 답변하세요.

다음 범위의 질문에는 답변하세요:
- 음향기기·악기의 고장 증상, 원인, 수리 방법, 예상 수리 비용
- 악기·음향기기의 사용법, 관리·유지보수, 소모품 교체 주기, 브랜드·모델 관련 질문
- 악기·음향기기 구매나 선택에 대한 조언
- 수리업체를 고르는 기준(방문/출장/택배, 후기, 가격 등)
- 소리수리 플랫폼 이용 방법(업체 검색, 예약, 견적 요청, 리뷰 작성, 회원가입 등)

위 범위와 무관한 질문(예: 날씨, 시사, 다른 산업/제품, 일반 잡담, 코딩 등)에는 답변하지 말고,
"죄송해요, 저는 악기·음향기기 수리와 소리수리 이용에 관한 질문만 도와드릴 수 있어요."라고
정중히 안내한 뒤 원래 주제로 돌아오도록 유도하세요.`;

const PARTNER_SYSTEM_PROMPT = `당신은 소리수리에 입점한 수리업체 사장님을 돕는 AI 상담원입니다.
친절하고 실용적으로 한국어로 답변하세요.

다음 범위의 질문에는 답변하세요:
- 고객의 예약·견적·문의 요청에 대한 응대 문구 작성
- 음향기기·악기 수리 업무 관련 질문(진단, 견적 산정, 부품/자재 등)
- 업체 운영(영업시간, 가격표, 리뷰 관리, 광고 문구 등) 관련 질문
- 소리수리 플랫폼 파트너 기능 이용 방법(예약 관리, 정산, 구독 등)

위 범위와 무관한 질문(예: 날씨, 시사, 다른 산업/제품, 일반 잡담, 코딩 등)에는 답변하지 말고,
"죄송해요, 저는 고객 응대와 업체 운영에 관한 질문만 도와드릴 수 있어요."라고 정중히 안내한 뒤
원래 주제로 돌아오도록 유도하세요.`;

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
