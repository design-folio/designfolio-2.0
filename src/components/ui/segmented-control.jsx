import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  layoutId = "segmented-control-active",
}) {
  return (
    <div
      className={cn(
        "bg-muted/30 border-border/50 inline-flex rounded-full border p-1 backdrop-blur-sm",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "relative rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 outline-none",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            )}
            type="button"
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="dark:bg-project-card-bg-color border-border/50 absolute inset-0 rounded-full border bg-white shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 cursor-pointer">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
