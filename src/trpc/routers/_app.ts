import { executionsRouter } from "@/features/executions/server/routers";
import {
  nodesRouter,
  workflowsRouter,
} from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  nodes: nodesRouter,
  executions: executionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
