import { prisma } from "@/lib/prisma";

/** Extracts the caller's IP from Vercel's forwarded-for header (falls back to "unknown"). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * Fixed-window rate limiter backed by the shared Postgres DB (works across
 * serverless instances, unlike an in-memory counter). Returns true when the
 * request is allowed, false when the caller has hit the limit for this
 * window.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const now = new Date();
  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || now.getTime() - existing.windowStart.getTime() > windowMs) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return true;
  }

  if (existing.count >= max) return false;

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}
