import React from "react";

export function Divider({ text = "OR" }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="border-border w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card text-muted-foreground px-3 font-medium">{text}</span>
      </div>
    </div>
  );
}
