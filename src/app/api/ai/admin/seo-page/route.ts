import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const VALID_TYPES = ["REGION", "BRAND", "SYMPTOM"] as const;

const SYSTEM_PROMPT = `당신은 지역 서비스 마켓플레이스의 SEO 콘텐츠 작가입니다. 반드시 다음 JSON
형식으로만 응답하세요:
{"title": "페이지 제목 (30자 이내)", "introText": "소개 문단 (3~4문장, 검색엔진과 사용자 모두에게
유용한 정보성 내용)"}
지어낸 업체명이나 통계는 절대 포함하지 말고, 일반적인 안내와 함께 아래 제공되는 실제 업체
목록을 자연스럽게 언급하세요. 한국어로 작성하세요.`;

function buildUserPrompt(type: string, keyword: string, companyNames: string[]) {
  const contextLabel =
    type === "REGION" ? "지역" : type === "BRAND" ? "브랜드" : "증상/키워드";
  return `유형: ${contextLabel}
키워드: ${keyword}
현재 등록된 관련 업체: ${companyNames.join(", ") || "(아직 없음)"}

이 ${contextLabel} 페이지의 제목과 소개 문단을 작성하세요.`;
}

export async function POST(req: Request) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const { type, keyword } = await req.json();

    if (!VALID_TYPES.includes(type) || !keyword?.trim()) {
      return NextResponse.json(
        { error: "type(REGION|BRAND|SYMPTOM)과 keyword가 필요합니다." },
        { status: 400 },
      );
    }

    const where =
      type === "REGION"
        ? { region: { contains: keyword }, status: "APPROVED" }
        : type === "BRAND"
          ? { brands: { some: { name: { contains: keyword } } }, status: "APPROVED" }
          : { services: { some: { name: { contains: keyword } } }, status: "APPROVED" };

    const companies = await prisma.company.findMany({ where, select: { name: true }, take: 20 });

    const raw = await runAiCompletion({
      type: "SEO",
      system: SYSTEM_PROMPT,
      user: buildUserPrompt(type, keyword, companies.map((c) => c.name)),
      userId: admin.id,
      json: true,
    });

    let parsed: { title?: string; introText?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI 응답을 해석하지 못했습니다. 다시 시도해주세요." },
        { status: 502 },
      );
    }
    if (!parsed.title || !parsed.introText) {
      return NextResponse.json(
        { error: "AI가 제목/본문을 생성하지 못했습니다." },
        { status: 502 },
      );
    }

    const seoPage = await prisma.seoPage.upsert({
      where: { type_keyword: { type, keyword } },
      update: { title: parsed.title, introText: parsed.introText },
      create: { type, keyword, title: parsed.title, introText: parsed.introText },
    });

    return NextResponse.json(seoPage);
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
