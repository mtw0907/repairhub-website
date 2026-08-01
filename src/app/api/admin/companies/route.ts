import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"]);
    const { name, ownerName, bizRegNo, address, region, phone, homepage, introduction } =
      await req.json();

    if (!name) {
      return NextResponse.json({ error: "업체명이 필요합니다." }, { status: 400 });
    }

    // Admin-registered companies start UNVERIFIED until claimed/approved,
    // matching the spec: "등록 완료 시: 업체 페이지 생성, 상태: 미인증 업체".
    const company = await prisma.company.create({
      data: {
        name,
        ownerName,
        bizRegNo,
        address,
        region,
        phone,
        homepage,
        introduction,
        status: "UNVERIFIED",
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
