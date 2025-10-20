import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import primsa from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(primsa, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
});
