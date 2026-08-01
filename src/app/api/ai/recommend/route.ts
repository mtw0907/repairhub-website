import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { runAiCompletion, toAiErrorResponse } from "@/lib/ai";

const SYSTEM_PROMPT = `당신은 RepairHub 플랫폼의 업체 추천 도우미입니다. 아래 "등록된 업체 목록"에
있는 업체만 추천할 수 있습니다. 목록에 없는 업체명을 절대 지어내지 마세요. 사용자의 요청에 가장
적합한 업체를 1~3개 골라 업체명과 추천 이유를 한국어로 간결하게 설명하세요. 적합한 업체가 목록에
없다면 그렇다고 솔직하게 답변하세요.`;

export async function POST(req: Request) {
  try {
    const user = await requireRole(["USER"]);
    const { need, region } = await req.json();
    if (!need) {
      return NextResponse.json({ error: "need가 필요합니다." }, { status: 400 });
    }

    const companies = await prisma.company.findMany({
      where: {
        status: "APPROVED",
        ...(region ? { region: { contains: region } } : {}),
      },
      include: { services: true, brands: true },
      take: 30,
    });

    const companyList = companies
      .map(
        (c) =>
          `- ${c.name} (지역: ${c.region ?? "미상"}, 서비스: ${c.services.map((s) => s.name).join("/") || "-"}, 브랜드: ${c.brands.map((b) => b.name).join("/") || "-"})`,
      )
      .join("\n");

    const userPrompt = `등록된 업체 목록:\n${companyList || "(등록된 업체 없음)"}\n\n사용자 요청: ${need}`;

    const result = await runAiCompletion({
      type: "RECOMMENDATION",
      system: SYSTEM_PROMPT,
      user: userPrompt,
      userId: user.id,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return toAiErrorResponse(error);
  }
}
