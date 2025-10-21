import { createTRPCRouter, protectedProcedure } from "../init";
import primsa from "@/lib/db";
export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return primsa.workflow.findMany();
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
