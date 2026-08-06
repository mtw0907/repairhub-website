import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) {
      throw new ForbiddenError();
    }

    const requests = await prisma.repairRequest.findMany({
      where: { status: { in: ["MATCHING", "QUOTED", "RESERVED"] } },
      include: { quotes: { where: { companyId: user.companyId } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const matched = requests
      .filter((r) => {
        const ids: string[] = r.matchedCompanyIds ? JSON.parse(r.matchedCompanyIds) : [];
        return ids.includes(user.companyId!);
      })
      .map((r) => ({
        id: r.id,
        instrument: r.instrument,
        brand: r.brand,
        symptom: r.symptom,
        status: r.status,
        createdAt: r.createdAt,
        userName: r.user.name,
        hasQuoted: r.quotes.length > 0,
      }));

    return NextResponse.json(matched);
  } catch (error) {
    return toErrorResponse(error);
  }
}
