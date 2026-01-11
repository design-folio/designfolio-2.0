import React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DragHandle({
    listeners,
    attributes,
    className,
    ...props
}) {
    const handleClick = (e) => {
        // Prevent navigation when clicking the drag handle
        e.preventDefault();
        e.stopPropagation();
    };

    return (
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
    );
}
