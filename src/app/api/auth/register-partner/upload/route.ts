import { NextResponse } from "next/server";
import {
  saveUploadedFile,
  UnsupportedFileError,
  FileTooLargeError,
  ALLOWED_VIDEO_TYPES,
} from "@/lib/uploadStorage";
import { isEmailVerified } from "@/lib/otp";
import { toErrorResponse } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email");
    const file = formData.get("file");

    if (typeof email !== "string") {
      return NextResponse.json({ error: "email 필드가 필요합니다." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file 필드가 필요합니다." }, { status: 400 });
    }
    if (!(await isEmailVerified(email, "REGISTER_PARTNER"))) {
      return NextResponse.json({ error: "이메일 인증을 먼저 완료해주세요." }, { status: 403 });
    }
    if (file.type in ALLOWED_VIDEO_TYPES) {
      return NextResponse.json({ error: "사업자등록증은 이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
    }

    const url = await saveUploadedFile(file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof UnsupportedFileError || error instanceof FileTooLargeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return toErrorResponse(error);
  }
}
