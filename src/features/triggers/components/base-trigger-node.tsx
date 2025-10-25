"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { WorkflowNode } from "@/components/workflow-node";
import { workflowIdAtom } from "@/features/editor/store/atoms";
import {
  useDeleteNode
} from "@/features/workflows/hooks/use-workflows";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useAtomValue } from "jotai";
import { type LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode } from "react";
import { toast } from "sonner";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseTriggerNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
  }: BaseTriggerNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const deleteNode = useDeleteNode();
    const workflowId = useAtomValue(workflowIdAtom);

    const handleDelete = () => {
      if (!workflowId) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      deleteNode.mutate(
        {
          id,
          workflowId,
        },
        {
          onSuccess: (data) => {
            setNodes((currentNodes) => {
              const updatedNodes = currentNodes.filter(
                (node) => node.id !== id
              );
              return updatedNodes;
            });

            setEdges((currentEdges) => {
              const updatedEdges = currentEdges.filter(
                (edge) => edge.source !== id && edge.target !== id
              );
              return updatedEdges;
            });

            toast.success(`Node has been deleted successfully.`);
            queryClient.invalidateQueries(
              trpc.workflows.getMany.queryOptions({})
            );
            queryClient.invalidateQueries(
              trpc.workflows.getOne.queryOptions({ id: data.id })
            );
          },
          onError: (error) => {
            toast.error(`Failed to delete node: ${error.message}.`);
          },
        }
      );
    };

    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSettings={onSettings}
        showToolbar={true}
        isDisabledOnDelete={deleteNode.isPending}
      >
        <BaseNode
          onDoubleClick={onDoubleClick}
          className="rounded-l-2xl relative group"
        >
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="size-4 text-muted-foreground" />
            )}
            {children}
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    );
  }
);

BaseTriggerNode.displayName = "BaseTriggerNode";
