"use client";

import { NodeSelector } from "@/components/node-selector";
import { Button } from "@/components/ui/button";
import { WithTooltip } from "@/components/with-tooltip";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";

export const AddNodeButton = memo(() => {
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <NodeSelector
      open={selectorOpen}
      onOpenChange={setSelectorOpen}
      trigger={
        <WithTooltip tooltip="Add">
          <Button
            size="icon"
            variant="outline"
            className="bg-background"
            onClick={() => setSelectorOpen(true)}
          >
            <PlusIcon />
          </Button>
        </WithTooltip>
      }
    />
  );
});

AddNodeButton.displayName = "AddNodeButton";
