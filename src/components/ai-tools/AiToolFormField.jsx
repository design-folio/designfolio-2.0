import React from "react";
import { cn } from "@/lib/utils";

// Exact match to AiWorkspace.tsx form styling
export const inputWrapperClass =
  "bg-white dark:bg-white border-2 border-border rounded-full hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden";
export const textareaWrapperClass =
  "bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden";
export const inputInnerClass =
  "border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/60 w-full";
export const textareaInnerClass =
  "border-0 bg-transparent min-h-[100px] px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground/60 resize-none w-full";
export const selectInnerClass =
  "w-full bg-transparent h-11 px-4 focus:outline-none text-base text-foreground appearance-none cursor-pointer";

export function AiToolButton({ children, className, disabled, ...props }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "w-full bg-foreground text-background hover:bg-foreground/90 focus-visible:outline-none border-0 rounded-full h-11 px-6 text-base font-semibold transition-colors disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
