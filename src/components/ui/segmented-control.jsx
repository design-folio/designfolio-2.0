import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SegmentedControl({ options, value, onChange, className }) {
  return (
    <div
      className={cn(
        "inline-flex p-1 bg-muted/30 backdrop-blur-sm rounded-full border border-border/50",
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
              "relative px-6 py-2 text-sm font-medium transition-colors duration-200 rounded-full outline-none",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            )}
            type="button"
          >
            {isActive && (
              <motion.div
                layoutId="segmented-control-active"
                className="absolute inset-0 bg-white dark:bg-[#1a1a1a] rounded-full shadow-sm border border-border/50"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
