import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@/lib/constants";
import { logAdminActivity } from "@/lib/adminLog";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

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
        if (!user || user.status !== "ACTIVE") return null;

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
  ],
});
