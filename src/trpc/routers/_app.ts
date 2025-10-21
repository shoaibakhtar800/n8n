import { inngest } from "@/inngest/client";
import { createTRPCRouter, protectedProcedure } from "../init";
import primsa from "@/lib/db";

export const appRouter = createTRPCRouter({
  testAI: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/ai"
    });

    return { success: true, message: "AI execution triggered."}
  }),
  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return primsa.workflow.findMany();
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
