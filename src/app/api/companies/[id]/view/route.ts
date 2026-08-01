import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.company
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});
  return NextResponse.json({ ok: true });
}
