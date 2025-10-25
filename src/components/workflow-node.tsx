"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { SettingsIcon, TrashIcon } from "lucide-react";
import { WithTooltip } from "./with-tooltip";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
  isDisabledOnDelete?: boolean;
}

export const WorkflowNode = ({
  children,
  showToolbar,
  onDelete,
  onSettings,
  name,
  description,
  isDisabledOnDelete
}: WorkflowNodeProps) => {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <WithTooltip tooltip="Edit">
            <Button size="sm" variant="ghost" onClick={onSettings}>
              <SettingsIcon className="size-4" />
            </Button>
          </WithTooltip>
          <WithTooltip tooltip="Delete">
            <Button size="sm" variant="ghost" onClick={onDelete} disabled={isDisabledOnDelete}>
              <TrashIcon className="size-4" />
            </Button>
          </WithTooltip>
        </NodeToolbar>
      )}
      {children}
      {!!name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="max-w-[200px] text-center"
        >
          <p className="font-medium">{name}</p>
          {!!description && (
            <p className="text-muted-foreground truncate text-sm">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
};
