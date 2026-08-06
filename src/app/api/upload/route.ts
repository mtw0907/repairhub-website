import { NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/rbac";
import { saveUploadedFile, UnsupportedFileError, FileTooLargeError } from "@/lib/uploadStorage";

export async function POST(req: Request) {
  try {
    await requireRole(["USER", "PARTNER"]);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file 필드가 필요합니다." }, { status: 400 });
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
