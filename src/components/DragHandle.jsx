import React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DragHandle({
    listeners,
    attributes,
    className,
    isButton = false,
    size, // "sm" = compact (h-8 w-8), matches icon buttons
    ...props
}) {
    const handleClick = (e) => {
        // Prevent navigation when clicking the drag handle
        e.preventDefault();
        e.stopPropagation();
    };

    const isCompact = size === "sm";

    return (

        <>
            {isButton ? (
                <Button
                    variant="outline"
                    size="icon"
                    style={{ touchAction: "none" }}
                    {...(listeners || {})}
                    {...(attributes || {})}
                    data-drag-handle
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className={cn("[cursor:grab] active:[cursor:grabbing] rounded-full", className)}
                    {...props}
                >
                    <GripVertical className="pointer-events-none size-4" />
                </Button>
            ) : isCompact ? (
                <div
                    data-drag-handle
                    {...(listeners || {})}
                    {...(attributes || {})}
                    style={{ touchAction: "none" }}
                    onClick={handleClick}
                    className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-200",
                        "bg-secondary-btn-bg-color hover:bg-secondary-btn-bg-hover-color border border-secondary-btn-border-color",
                        "text-secondary-btn-text-color [cursor:grab] active:[cursor:grabbing]",
                        className
                    )}
                    {...props}
                >
                    <GripVertical className="pointer-events-none w-4 h-4" />
                </div>
            ) : (
                <div
                    data-drag-handle
                    {...(listeners || {})}
                    {...(attributes || {})}
                    style={{ touchAction: "none" }}
                    onClick={handleClick}
                    className={cn(
                        "px-[24.5px] py-[19px] transition-shadow duration-500 ease-out bg-project-card-reorder-btn-bg-color rounded-full border-project-card-reorder-btn-bg-color hover:border-project-card-reorder-btn-bg-hover-color hover:bg-project-card-reorder-btn-bg-hover-color [cursor:grab] active:[cursor:grabbing]",
                        className
                    )}
                    {...props}
                >
                    <GripVertical className="text-project-card-reorder-btn-icon-color pointer-events-none w-5 h-5" />
                </div>
            )}

        </>
    );
}
