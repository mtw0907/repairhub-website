import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/constants";

export class UnauthorizedError extends Error {
  constructor(message = "로그인이 필요합니다.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "권한이 없습니다.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

type SessionUser = {
  id: string;
  role: Role;
  companyId?: string | null;
};

/**
 * Server-side (API route / server action) role guard.
 * SUPER_ADMIN always passes; every other role must be explicitly listed
 * in `allowed`. Throws UnauthorizedError (no session) or ForbiddenError
 * (wrong role) — callers should catch and map to 401/403 responses.
 */
export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user) throw new UnauthorizedError();
  if (user.role === "SUPER_ADMIN") return user;
  if (!allowed.includes(user.role)) throw new ForbiddenError();
  return user;
}

/**
 * Ensures the caller is a PARTNER acting on their own company's data.
 * Never trust a companyId supplied by the client without this check —
 * always compare it against the companyId stored in the session, e.g.:
 *
 *   const user = await requireOwnCompany(companyIdFromRequest);
 *   const reservations = await prisma.reservation.findMany({
 *     where: { companyId: user.companyId! },
 *   });
 */
export async function requireOwnCompany(companyId: string): Promise<SessionUser> {
  const user = await requireRole(["PARTNER"]);
  if (user.companyId !== companyId) throw new ForbiddenError();
  return user;
}

/** Returns the logged-in session user regardless of role, or throws UnauthorizedError. */
export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Maps rbac.ts errors to HTTP responses; falls back to 500 for anything else. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  console.error(error);
  return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
}
