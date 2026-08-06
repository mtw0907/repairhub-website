import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@/lib/constants";
import { logAdminActivity } from "@/lib/adminLog";
import { getSetting } from "@/lib/systemSettings";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

// OAuth apps are configured at runtime via super-admin settings (DB), so
// their client id/secret are fetched once at server startup, same as the
// SMTP/payment/AI keys. A provider is only registered when both values
// are present — otherwise its login button never shows up.
const [googleId, googleSecret, kakaoId, kakaoSecret, naverId, naverSecret] = await Promise.all([
  getSetting("GOOGLE_CLIENT_ID"),
  getSetting("GOOGLE_CLIENT_SECRET"),
  getSetting("KAKAO_CLIENT_ID"),
  getSetting("KAKAO_CLIENT_SECRET"),
  getSetting("NAVER_CLIENT_ID"),
  getSetting("NAVER_CLIENT_SECRET"),
]);

const oauthProviders = [
  googleId && googleSecret ? Google({ clientId: googleId, clientSecret: googleSecret }) : null,
  kakaoId && kakaoSecret ? Kakao({ clientId: kakaoId, clientSecret: kakaoSecret }) : null,
  naverId && naverSecret ? Naver({ clientId: naverId, clientSecret: naverSecret }) : null,
].filter((provider) => provider !== null);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || user.status !== "ACTIVE" || !user.password) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);

        // Only admin/super-admin logins are recorded here — this log is
        // scoped to admin activity, not a general user audit trail.
        if (ADMIN_ROLES.has(user.role)) {
          await logAdminActivity(user.id, valid ? "LOGIN_SUCCESS" : "LOGIN_FAILURE");
        }

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          companyId: user.companyId,
        };
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Credentials already checks status inside authorize(); this covers
      // the OAuth path, where a suspended/withdrawn account could otherwise
      // sign back in through a provider without ever hitting authorize().
      if (account && account.provider !== "credentials" && user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser && dbUser.status !== "ACTIVE") return false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // OAuth sign-in: no local User row is created by NextAuth itself
      // (there's no Adapter), so find-or-create it here by email, then
      // trust our own DB record for role/companyId instead of the
      // provider's profile payload.
      if (account && account.provider !== "credentials" && user?.email) {
        const dbUser =
          (await prisma.user.findUnique({ where: { email: user.email } })) ??
          (await prisma.user.create({
            data: { email: user.email, name: user.name ?? user.email, role: "USER" },
          }));
        token.id = dbUser.id;
        token.role = dbUser.role as Role;
        token.companyId = dbUser.companyId;
        return token;
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
  },
});
