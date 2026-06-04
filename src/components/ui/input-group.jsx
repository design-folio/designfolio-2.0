import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

const InputGroup = React.forwardRef(function InputGroup({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-10 items-center rounded-xl border border-transparent bg-black/[0.03] dark:bg-white/[0.03] overflow-hidden transition-colors",
        "focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/10 focus-within:border-black/20 dark:focus-within:border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
InputGroup.displayName = "InputGroup";

const InputGroupInput = React.forwardRef(function InputGroupInput({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      className={cn(
        "h-full flex-1 min-w-0 w-auto border-transparent bg-transparent rounded-none shadow-none",
        "focus-visible:ring-0 focus-visible:border-transparent",
        className
      )}
      {...props}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";

const InputGroupAddon = React.forwardRef(function InputGroupAddon({ className, children, ...props }, ref) {
  return (
    <div ref={ref} className={cn("flex shrink-0 items-center", className)} {...props}>
      {children}
    </div>
  );
});
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupText = React.forwardRef(function InputGroupText({ className, children, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn("px-3 text-[13px] font-medium text-muted-foreground select-none", className)}
      {...props}
    >
      {children}
    </span>
  );
});
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText };
