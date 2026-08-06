import { prisma } from "@/lib/prisma";

// Predefined keys the settings UI manages explicitly. Anything else stored
// in SystemSetting shows up under "기타 환경변수" as a free-form entry.
export const KNOWN_SETTING_KEYS = [
  "OPENAI_API_KEY",
  "AI_MODEL",
  "PAYMENT_PROVIDER",
  "PAYMENT_CLIENT_KEY",
  "PAYMENT_SECRET_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM",
  "REGISTRATION_LOCKED",
  "MAINTENANCE_MODE",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "KAKAO_CLIENT_ID",
  "KAKAO_CLIENT_SECRET",
  "NAVER_CLIENT_ID",
  "NAVER_CLIENT_SECRET",
  "KAKAO_MAP_JS_KEY",
] as const;

const SENSITIVE_KEYS = new Set([
  "OPENAI_API_KEY",
  "PAYMENT_SECRET_KEY",
  "SMTP_PASSWORD",
  "GOOGLE_CLIENT_SECRET",
  "KAKAO_CLIENT_SECRET",
  "NAVER_CLIENT_SECRET",
]);

export function isSensitiveKey(key: string) {
  return SENSITIVE_KEYS.has(key) || /KEY|SECRET|PASSWORD/i.test(key);
}

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function isMaintenanceMode(): Promise<boolean> {
  return (await getSetting("MAINTENANCE_MODE")) === "true";
}

export async function isRegistrationLocked(): Promise<boolean> {
  return (await getSetting("REGISTRATION_LOCKED")) === "true";
}
