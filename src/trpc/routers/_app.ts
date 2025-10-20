import { createTRPCRouter, protectedProcedure } from "../init";
import primsa from "@/lib/db";
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ ctx }) => {
    console.log("User ID:", ctx.auth.user.id);

    return primsa.user.findMany();
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
