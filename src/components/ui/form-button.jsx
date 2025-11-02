import React from "react";
import { Button } from "@/components/ui/button";

export function FormButton({
    children,
    type = "button",
    variant = "darker",
    isLoading = false,
    disabled = false,
    className = "",
    ...props
}) {
    return (
        <Button
            variant={variant}
            type={type}
            className={`w-full rounded-full h-11 px-6 text-base font-semibold no-default-hover-elevate no-default-active-elevate transition-colors ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </Button>
    );
}