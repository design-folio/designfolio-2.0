import React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./button";

export default function DragHandle({
    listeners,
    attributes,
    className,
    isButton = false,
    ...props
}) {
    const handleClick = (e) => {
        // Prevent navigation when clicking the drag handle
        e.preventDefault();
        e.stopPropagation();
    };

    return (

        <>
            {isButton ? (
                <div
                    style={{ touchAction: "none" }}
                    {...(listeners || {})}
                    {...(attributes || {})}
                    data-drag-handle
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className={cn(
                        "inline-flex gap-2 items-center justify-center transition-shadow duration-500 ease-out",
                        "px-3 py-2 rounded-full",
                        "bg-secondary-btn-bg-color hover:bg-secondary-btn-bg-hover-color text-secondary-btn-text-color border-solid border border-secondary-btn-border-color hover:secondary-btn-bg-hover-color hover:shadow-secondary-btn [cursor:grab] active:[cursor:grabbing]",
                        className
                    )}
                    {...props}
                >
                    <GripVertical className="pointer-events-none size-4" />
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
