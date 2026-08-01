import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== "USER") {
    // Recent-view tracking is a USER-only convenience feature; silently
    // no-op for anonymous visitors or other roles instead of erroring.
    return NextResponse.json({ recorded: false });
  }

  const { companyId } = await req.json();
  if (!companyId) {
    return NextResponse.json({ error: "companyId가 필요합니다." }, { status: 400 });
  }

  const existing = await prisma.recentView.findFirst({
    where: { userId: user.id, companyId },
  });

  if (existing) {
    await prisma.recentView.update({
      where: { id: existing.id },
      data: { viewedAt: new Date() },
    });
  } else {
    await prisma.recentView.create({ data: { userId: user.id, companyId } });
  }

  return NextResponse.json({ recorded: true });
}
