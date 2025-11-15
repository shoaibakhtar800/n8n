"use client";

import { DEEPSEEK_CHANNEL_NAME } from "@/inngest/channels/deepseek";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchDeepseekRealtimeToken } from "./actions";
import { AVAILABLE_MODELS, DeepseekDialog, DeepseekFormValues } from "./dialog";

type DeepseekNodeData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type DeepseekNodeType = Node<DeepseekNodeData>;

export const DeepseekNode = memo((props: NodeProps<DeepseekNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: DEEPSEEK_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchDeepseekRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const onSubmitSetNodeData = (values: DeepseekFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }

        return node;
      })
    );
  };

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]} : ${nodeData.userPrompt.slice(0, 50)}...`
    : "Not configured";

  return (
    <>
      <DeepseekDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmitSetNodeData={onSubmitSetNodeData}
        defaultValues={nodeData}
        nodeId={props.id}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/node-logos/deepseek.svg"
        name="Deepseek"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

DeepseekNode.displayName = "DeepseekNode";
