import React from "react";

export default function Popover({ children, show, className = "" }) {
  return (
    <div
      className={`fixed md:hidden px-[12px] top-[62px] shadow-popver-shadow transform origin-top-right w-full z-50 overflow-hidden transition-all duration-100 ease-out ${
        show
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90 pointer-events-none"
      } ${className}`}
    >
      <div className="bg-popover-bg-color rounded-2xl shadow-lg border-[5px] border-popover-border-color p-4">
        {children}
      </div>
    </div>
  );
}
