import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse, ForbiddenError } from "@/lib/rbac";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  ownerName: z.string().optional(),
  bizRegNo: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  homepage: z.string().optional(),
  introduction: z.string().optional(),
  seoDescription: z.string().optional(),
  businessHours: z.string().optional(),
  closedDays: z.string().optional(),
  sns: z.string().optional(),
  logoUrl: z.string().optional(),
  photos: z.array(z.string()).optional(),
  onSiteVisit: z.boolean().optional(),
  courierDrop: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  try {
    const user = await requireRole(["PARTNER"]);
    if (!user.companyId) throw new ForbiddenError("소속된 업체가 없습니다.");

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { photos, ...rest } = parsed.data;

    const updated = await prisma.company.update({
      where: { id: user.companyId },
      data: {
        ...rest,
        ...(photos !== undefined ? { photos: JSON.stringify(photos) } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}
