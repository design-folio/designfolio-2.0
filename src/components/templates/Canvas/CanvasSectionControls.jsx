import React, { forwardRef } from "react";
import { Button } from "../../ui/button";

export function CanvasSectionControls({ children, forceVisible = false }) {
  return (
    <div
      className={`absolute -top-3 -right-3 z-30 flex gap-2 transition-opacity ${
        forceVisible
          ? "opacity-100"
          : "opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
      }`}
    >
      {children}
    </div>
  );
}

export const CanvasSectionButton = forwardRef(function CanvasSectionButton({ onClick, icon, label, ariaLabel, asChild, children, ...props }, ref) {
  const baseClass =
    "rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors cursor-pointer";

  if (label) {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        onClick={onClick}
        aria-label={ariaLabel}
        className={`h-8 flex items-center gap-1.5 px-3 ${baseClass}`}
        {...props}
      >
        <span className="pointer-events-none flex items-center gap-1.5">
          <span className="text-[#1A1A1A] dark:text-[#F0EDE7] flex items-center">{icon}</span>
          <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">{label}</span>
        </span>
      </Button>
    );
  }

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-8 h-8 ${baseClass}`}
      {...props}
    >
      <span className="pointer-events-none flex items-center justify-center text-[#1A1A1A] dark:text-[#F0EDE7]">
        {icon}
      </span>
    </Button>
  );
});
