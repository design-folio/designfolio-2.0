import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronsUpDown } from "lucide-react";
import React from "react";

export const MonoRearrangeButton = ({ onClick, title, tooltipText, ariaLabel, ...props }) => {
  const iconButton = (
    <Button
      variant="outline"
      size="sm"
      className="h-8 w-8 rounded-full border-black/10 bg-white p-0 opacity-100 shadow-sm transition-opacity hover:bg-gray-50 md:opacity-0 md:group-hover/section:opacity-100 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
      onClick={onClick}
      title={tooltipText ? undefined : title}
      aria-label={ariaLabel ?? title ?? tooltipText}
      {...props}
    >
      <ChevronsUpDown className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
    </Button>
  );

  if (!tooltipText) {
    return iconButton;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{iconButton}</TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className="bg-tooltip-bg-color text-tooltip-text-color rounded-xl border-0 px-4 py-2 shadow-xl"
        >
          <span className="text-scaled-14 font-medium">{tooltipText}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
