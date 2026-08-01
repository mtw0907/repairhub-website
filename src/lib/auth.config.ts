import type { NextAuthConfig } from "next-auth";

// Lean config with no Prisma/bcrypt: kept separate so proxy.ts only ever
// does a JWT-based "optimistic" role check (per Next.js's auth guidance)
// instead of touching the database on every request.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as (typeof session.user)["role"];
        session.user.companyId = (token.companyId as string | null | undefined) ?? null;
      }
      return session;
    },
  },
};
