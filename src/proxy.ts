// Next.js 16 renamed `middleware.ts` -> `proxy.ts` (functionality is the
// same). Role checks below stay JWT-only (no DB) per Next's "optimistic
// checks" guidance. The maintenance-mode check is the one deliberate
// exception: it inherently needs a per-request DB read since there's no
// way to gate every page without checking a live flag.
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { isMaintenanceMode } from "@/lib/systemSettings";
import type { Role } from "@/lib/constants";

const { auth } = NextAuth(authConfig);

const ROUTE_ROLE_MAP: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard", roles: ["USER"] },
  { prefix: "/partner", roles: ["PARTNER"] },
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/super-admin", roles: ["SUPER_ADMIN"] },
];

const MAINTENANCE_HTML = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8" />
<title>점검 중 - RepairHub</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: system-ui, sans-serif; background: #fafafa; color: #171717;
    display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
  .box { padding: 2rem; }
  h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
  p { color: #737373; font-size: 0.9rem; }
</style>
</head><body>
<div class="box">
  <h1>시스템 점검 중입니다</h1>
  <p>더 나은 서비스를 위해 잠시 점검하고 있습니다. 곧 다시 찾아주세요.</p>
</div>
</body></html>`;

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (role !== "SUPER_ADMIN" && pathname !== "/login" && (await isMaintenanceMode())) {
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const match = ROUTE_ROLE_MAP.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  if (!role) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowed = role === "SUPER_ADMIN" || match.roles.includes(role);
  if (!allowed) {
    return NextResponse.redirect(new URL("/403", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)",
  ],
};
