import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

const InputGroup = React.forwardRef(function InputGroup({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-10 items-center overflow-hidden rounded-xl border border-transparent bg-black/[0.03] transition-colors dark:bg-white/[0.03]",
        "focus-within:border-black/20 focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:border-white/20 dark:focus-within:ring-white/10",
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
        "dark:bg-bg-transparent h-full w-auto min-w-0 flex-1 rounded-none border-transparent bg-transparent shadow-none",
        "focus-visible:border-transparent focus-visible:ring-0",
        className
      )}
      {...props}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";

const InputGroupAddon = React.forwardRef(function InputGroupAddon(
  { className, children, ...props },
  ref
) {
  return (
    <div ref={ref} className={cn("flex shrink-0 items-center", className)} {...props}>
      {children}
    </div>
  );
});
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupText = React.forwardRef(function InputGroupText(
  { className, children, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn("text-muted-foreground px-3 text-[13px] font-medium select-none", className)}
      {...props}
    >
      {children}
    </span>
  );
});
InputGroupText.displayName = "InputGroupText";

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText };
