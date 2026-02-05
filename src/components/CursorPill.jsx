import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { useCursorTooltip } from "@/context/cursorTooltipContext";

const PILL_OFFSET_X = 14;
const PILL_OFFSET_Y = 14;

export function CursorPill() {
  const { show, text, icon } = useCursorTooltip();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (show) {
      document.body.classList.add("cursor-pill-active");
    } else {
      document.body.classList.remove("cursor-pill-active");
    }
    return () => document.body.classList.remove("cursor-pill-active");
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[99999] pointer-events-none mix-blend-normal will-change-transform"
      style={{
        transform: `translate(${position.x + PILL_OFFSET_X}px, ${position.y + PILL_OFFSET_Y}px)`,
      }}
    >
      <div
        className="flex items-center gap-2 bg-df-orange-color text-white px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
        style={{
          transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
        }}
      >
        {icon ?? <Eye className="w-4 h-4" />}
        <span className="text-[10px] font-bold uppercase tracking-wider">{text}</span>
      </div>
    </div>
  );
}
