import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";
import { REPAIR_REQUEST_DAILY_LIMIT } from "@/lib/constants";

const SYSTEM_PROMPT = `당신은 악기 및 음향기기 고장 진단 전문가입니다. 사용자가 입력한 종류/브랜드/증상을
바탕으로 예상 고장 원인 1~2순위, 예상 수리 비용 범위(원 단위), 추천 수리 전문 분야를 분석하세요.
반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{"causes":[{"rank":1,"label":"원인명","description":"1~2문장 설명"},{"rank":2,"label":"원인명","description":"1~2문장 설명"}],"priceMin":30000,"priceMax":80000,"specialties":["추천 전문 분야1","추천 전문 분야2"]}`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { category, instrument, brand, symptom, photos, videos } = await req.json();

    if (!category || !instrument || !symptom) {
      return NextResponse.json(
        { error: "category, instrument, symptom은 필수입니다." },
        { status: 400 },
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.repairRequest.count({
      where: { userId: user.id, createdAt: { gte: todayStart } },
    });
    if (todayCount >= REPAIR_REQUEST_DAILY_LIMIT) {
      return NextResponse.json(
        { error: `AI 수리 견적 매칭은 하루 최대 ${REPAIR_REQUEST_DAILY_LIMIT}회까지 이용 가능합니다. 내일 다시 시도해주세요.` },
        { status: 429 },
      );
    }

    const userPrompt = `종류: ${instrument}${brand ? `\n브랜드: ${brand}` : ""}\n증상: ${symptom}`;

    const raw = await runAiCompletion({
      type: "REPAIR_MATCH_ANALYSIS",
      system: SYSTEM_PROMPT,
      user: userPrompt,
      userId: user.id,
      json: true,
    });

    let aiResult: unknown;
    try {
      aiResult = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI 분석 결과를 해석하지 못했습니다. 다시 시도해주세요." },
        { status: 502 },
      );
    }

    const repairRequest = await prisma.repairRequest.create({
      data: {
        userId: user.id,
        category,
        instrument,
        brand: brand || null,
        symptom,
        photos: Array.isArray(photos) && photos.length > 0 ? JSON.stringify(photos) : null,
        videos: Array.isArray(videos) && videos.length > 0 ? JSON.stringify(videos) : null,
        aiResult: JSON.stringify(aiResult),
        status: "ANALYZED",
      },
    });

    return NextResponse.json(repairRequest, { status: 201 });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}

export async function GET() {
  try {
    const user = await requireRole(["USER"]);
    const requests = await prisma.repairRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
