import { executionsRouter } from "@/features/executions/server/routers";
import {
  nodesRouter,
  workflowsRouter,
} from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";
import { credentialsRouter } from "@/features/credentials/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  nodes: nodesRouter,
  executions: executionsRouter,
  credentials: credentialsRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
