import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface WithTooltipProps {
  children: ReactNode;
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

export const WithTooltip = ({
  children,
  tooltip,
  side,
  disabled,
}: WithTooltipProps) => {
  if (disabled) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};
