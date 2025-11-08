import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

/**
 * Hook to update an execution node.
 */
export const useUpdateExecutionNode = () => {
  const trpc = useTRPC();

  return useMutation(trpc.executions.update.mutationOptions());
};
