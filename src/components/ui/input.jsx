import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(function Input({ className, type, ...props }, ref) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-transparent bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-1 text-sm text-foreground shadow-none transition-all " +
        "file:border-0 file:bg-transparent file:text-sm file:font-medium " +
        "placeholder:text-black/30 dark:placeholder:text-white/30 " +
        "focus-visible:outline-none focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 " +
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
