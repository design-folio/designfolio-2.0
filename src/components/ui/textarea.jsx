import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "text-foreground flex w-full rounded-xl border border-transparent bg-black/[0.03] px-3.5 py-2.5 text-sm shadow-none transition-all dark:bg-white/[0.03] " +
          "placeholder:text-black/30 dark:placeholder:text-white/30 " +
          "focus-visible:border-black/20 focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:outline-none dark:focus-visible:border-white/20 dark:focus-visible:ring-white/10 " +
          "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
