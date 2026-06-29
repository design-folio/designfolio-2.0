import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { useCursorTooltip } from "@/context/cursorTooltipContext";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  if (!show || isMobile) return null;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[99999] mix-blend-normal will-change-transform"
      style={{
        transform: `translate(${position.x + PILL_OFFSET_X}px, ${position.y + PILL_OFFSET_Y}px)`,
      }}
    >
      <div
        className="bg-df-orange-color flex items-center gap-2 rounded-full px-3 py-1.5 whitespace-nowrap text-white shadow-lg"
        style={{
          transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
        }}
      >
        {icon ?? <Eye className="h-4 w-4" />}
        <span className="text-[10px] font-bold tracking-wider uppercase">{text}</span>
      </div>
    </div>
  );
}
