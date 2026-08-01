import OpenAI from "openai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/systemSettings";
import { toErrorResponse } from "@/lib/rbac";

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI 기능을 사용하려면 최고관리자가 시스템 설정에서 OpenAI API Key를 등록해야 합니다.");
    this.name = "AiNotConfiguredError";
  }
}

async function getClient(): Promise<OpenAI> {
  const key = (await getSetting("OPENAI_API_KEY")) || process.env.OPENAI_API_KEY;
  if (!key) throw new AiNotConfiguredError();
  return new OpenAI({ apiKey: key });
}

async function getModel(): Promise<string> {
  return (await getSetting("AI_MODEL")) || "gpt-4o-mini";
}

// type: DIAGNOSIS | RECOMMENDATION | COST_ESTIMATE | CHATBOT | BLOG | AD_COPY |
//       WORK_CASE | REVIEW_REPLY | FAQ | CUSTOMER_CHAT (see prisma/schema.prisma)
export async function runAiCompletion(params: {
  type: string;
  system: string;
  user: string;
  userId?: string;
  json?: boolean;
}): Promise<string> {
  const client = await getClient();
  const model = await getModel();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
    ...(params.json ? { response_format: { type: "json_object" as const } } : {}),
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const tokens = completion.usage?.total_tokens ?? 0;

  await prisma.aiUsageLog.create({
    data: { userId: params.userId, type: params.type, tokens },
  });

  return text;
}

// Maps AiNotConfiguredError to a 503 ("not set up yet", not a real failure)
// and falls back to the standard RBAC error mapping for everything else
// (including raw OpenAI API errors, e.g. invalid key -> treated as 502).
export function toAiErrorResponse(error: unknown): NextResponse {
  if (error instanceof AiNotConfiguredError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  if (error instanceof OpenAI.APIError) {
    return NextResponse.json(
      { error: `AI 호출 중 오류가 발생했습니다: ${error.message}` },
      { status: 502 },
    );
  }
  return toErrorResponse(error);
}
