import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

export class UnsupportedFileError extends Error {}
export class FileTooLargeError extends Error {
  constructor(public isVideo: boolean) {
    super(isVideo ? "영상 크기는 20MB 이하여야 합니다." : "파일 크기는 5MB 이하여야 합니다.");
  }
}

/** Saves an image or video File to Vercel Blob and returns its public URL. */
export async function saveUploadedFile(file: File): Promise<string> {
  const isVideo = file.type in ALLOWED_VIDEO_TYPES;
  const ext = ALLOWED_IMAGE_TYPES[file.type] ?? ALLOWED_VIDEO_TYPES[file.type];
  if (!ext) throw new UnsupportedFileError("지원하지 않는 파일 형식입니다.");

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) throw new FileTooLargeError(isVideo);

  const filename = `${randomUUID()}.${ext}`;
  const blob = await put(`uploads/${filename}`, file, { access: "public" });
  return blob.url;
}

/** Reads a previously uploaded blob (by its public URL) back as a base64 data URL. */
export async function readUploadedFileAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`업로드된 파일을 불러오지 못했습니다: ${res.status}`);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}
