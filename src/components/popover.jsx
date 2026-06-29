import React from "react";

export default function Popover({ children, show, className = "" }) {
  return (
    <div
      className={`shadow-popver-shadow fixed top-[62px] z-[60] w-full origin-top-right transform overflow-hidden px-[12px] transition-all duration-100 ease-out md:hidden ${
        show ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
      } ${className}`}
    >
      <div className="bg-popover-bg-color border-popover-border-color rounded-2xl border-[5px] p-4 shadow-lg">
        {children}
      </div>
    </div>
  );
}

export function TempPopoverForLanding({ children, show, className = "" }) {
  return (
    <div
      className={`shadow-popver-shadow fixed top-[72px] z-[60] w-full origin-top-right transform overflow-hidden px-[12px] transition-all duration-100 ease-out md:hidden ${
        show ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
      } ${className}`}
    >
      <div className="bg-background-landing border-border rounded-2xl border-[5px] p-4 shadow-sm">
        {children}
      </div>
    </div>
  );
}
