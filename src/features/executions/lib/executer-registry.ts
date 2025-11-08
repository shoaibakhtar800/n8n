import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { manualTriggerExecuter } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecuter } from "../components/http-request/executor";

export const executerRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecuter,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecuter,
  [NodeType.HTTP_REQUEST]: httpRequestExecuter,
};

export const getExecuter = (type: NodeType): NodeExecutor => {
  const executer = executerRegistry[type];
  if (!executer) {
    throw new Error(`No executer found for node type: ${type}`);
  }

  return executer;
};
