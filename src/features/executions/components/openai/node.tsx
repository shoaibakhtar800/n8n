"use client";

import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchOpenAIRealtimeToken } from "./actions";
import { AVAILABLE_MODELS, OpenAIDialog, OpenAIFormValues } from "./dialog";

type OpenAINodeData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  credentialId?: string;
  userPrompt?: string;
};

type OpenAINodeType = Node<OpenAINodeData>;

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenAIRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const onSubmitSetNodeData = (values: OpenAIFormValues) => {
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
      <OpenAIDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmitSetNodeData={onSubmitSetNodeData}
        defaultValues={nodeData}
        nodeId={props.id}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/node-logos/openai.svg"
        name="OpenAI"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

OpenAINode.displayName = "OpenAINode";
