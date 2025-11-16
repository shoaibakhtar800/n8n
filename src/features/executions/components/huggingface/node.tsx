"use client";

import { HUGGINGFACE_CHANNEL_NAME } from "@/inngest/channels/huggingface";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchHuggingfaceRealtimeToken } from "./actions";
import { AVAILABLE_MODELS, HuggingfaceDialog, HuggingfaceFormValues } from "./dialog";

type HuggingfaceNodeData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  credentialId?: string;
  userPrompt?: string;
};

type HuggingfaceNodeType = Node<HuggingfaceNodeData>;

export const HuggingfaceNode = memo((props: NodeProps<HuggingfaceNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HUGGINGFACE_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchHuggingfaceRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const onSubmitSetNodeData = (values: HuggingfaceFormValues) => {
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
      <HuggingfaceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmitSetNodeData={onSubmitSetNodeData}
        defaultValues={nodeData}
        nodeId={props.id}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/node-logos/hf-logo.svg"
        name="Hugging Face"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

HuggingfaceNode.displayName = "HuggingfaceNode";
