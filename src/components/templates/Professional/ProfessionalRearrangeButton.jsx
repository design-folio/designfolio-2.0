import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronsUpDown } from "lucide-react";
import React from "react";

export const ProfessionalRearrangeButton = ({
    onClick,
    title,
    tooltipText,
    ariaLabel,
    ...props
}) => {
    const iconButton = (
        <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full border-[#D5D0C6] dark:border-[#3A352E] bg-[#EFECE6] dark:bg-[#1A1A1A] hover:bg-[#E5E0D8] dark:hover:bg-[#2A2520] text-[#1A1A1A] dark:text-[#F0EDE7] opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity"
            onClick={onClick}
            title={tooltipText ? undefined : title}
            aria-label={ariaLabel ?? title ?? tooltipText}
            {...props}
        >
            <ChevronsUpDown className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
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
                    className="rounded-xl border-0 bg-tooltip-bg-color px-4 py-2 text-tooltip-text-color shadow-xl"
                >
                    <span className="text-sm font-medium">{tooltipText}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
