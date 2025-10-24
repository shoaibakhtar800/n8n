import { createTRPCRouter } from "../init";
import { nodesRouter, workflowsRouter } from "@/features/workflows/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  nodes: nodesRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
