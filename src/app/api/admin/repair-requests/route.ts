import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);

    const requests = await prisma.repairRequest.findMany({
      include: { user: { select: { name: true, email: true } }, quotes: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const result = requests.map((r) => ({
      id: r.id,
      instrument: r.instrument,
      brand: r.brand,
      status: r.status,
      createdAt: r.createdAt,
      userName: r.user.name,
      userEmail: r.user.email,
      matchedCount: r.matchedCompanyIds ? (JSON.parse(r.matchedCompanyIds) as string[]).length : 0,
      quoteCount: r.quotes.length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
