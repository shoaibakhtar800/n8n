import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { polarClient } from "@/lib/polar";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({ ctx: { ...ctx, auth: session } });
});
export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });

    const workflowCount = await prisma.workflow.count({
      where: {
        userId: ctx.auth.user.id,
      },
    });

    if (
      workflowCount >= 5 &&
      (!customer.activeSubscriptions ||
        customer.activeSubscriptions.length === 0)
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must have an active subscription to use this resource",
      });
    }

    return next({ ctx: { ...ctx, ...customer } });
  }
);
