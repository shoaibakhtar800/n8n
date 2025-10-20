import { baseProcedure, createTRPCRouter } from "../init";
import primsa from "@/lib/db";
export const appRouter = createTRPCRouter({
  getUsers: baseProcedure.query(() => {
    return primsa.user.findMany();
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
