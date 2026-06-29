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
      className={`no-default-hover-elevate no-default-active-elevate w-full rounded-full px-6 text-base font-semibold transition-colors ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  );
}
