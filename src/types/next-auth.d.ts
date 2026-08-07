import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constants";

declare module "next-auth" {
  interface User {
    role: Role;
    companyId?: string | null;
    termsAgreedAt?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      companyId?: string | null;
      termsAgreedAt?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    companyId?: string | null;
    termsAgreedAt?: string | null;
  }
}
