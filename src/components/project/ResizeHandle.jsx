import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * In-image resize handle for section images.
 * Both axes sit INSET on the image (like Figma) so they never float in empty
 * grid space. The outer box (boxRef) has no overflow:hidden, so these render
 * on top of the image content at z-index 20.
 *
 * Pill design matches the thumbnail handle (ProjectHero) exactly:
 *  height → horizontal 3-dot pill, bottom-center of image
 *  width  → vertical 3-dot pill, right-center of image
 *
 * Props:
 *  axis             "height" | "width"
 *  show             parent image-hover flag
 *  getSize          () => { width, height }  current box px at drag start
 *  min              number (default 120)
 *  max              number | (() => number)
 *  onResizingChange (isResizing: boolean) => void
 *  onHoverChange    (isHovered: boolean) => void  drives the indigo glow
 *  onChange         ({ width, height }) => void
 */
export default function ResizeHandle({
  axis,
  show,
  getSize,
  min = 120,
  max,
  onResizingChange,
  onHoverChange,
  onChange,
}) {
  const [isResizing, setIsResizing] = useState(false);
  const isHeight = axis === "height";

  const resolveMax = () => {
    const m = typeof max === "function" ? max() : max;
    return typeof m === "number" && Number.isFinite(m) ? m : Infinity;
  };

  const setResizing = (v) => {
    setIsResizing(v);
    onResizingChange?.(v);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startPointer = isHeight ? e.clientY : e.clientX;
    const startSize = getSize?.() ?? { width: min, height: min };
    const base = isHeight ? startSize.height : startSize.width;
    const maxSize = resolveMax();
    setResizing(true);

    // Lock cursor on body so fast drags that leave the handle keep the right cursor
    const dragCursor = isHeight ? "ns-resize" : "ew-resize";
    const prev = document.body.style.cursor;
    document.body.style.cursor = dragCursor;

    const onMove = (ev) => {
      ev.preventDefault();
      const delta = (isHeight ? ev.clientY : ev.clientX) - startPointer;
      const next = Math.round(Math.max(min, Math.min(maxSize, base + delta)));
      onChange(
        isHeight
          ? { width: startSize.width, height: next }
          : { width: next, height: startSize.height }
      );
    };
    const onUp = () => {
      setResizing(false);
      document.body.style.cursor = prev;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Both axes straddle their respective edges (center of handle = edge of image box),
  // matching the thumbnail handle in ProjectHero.
  const positionStyle = isHeight
    ? { bottom: -22, left: "50%", width: 160, height: 44, zIndex: 20, cursor: "ns-resize" }
    : { right: -22, top: "50%", width: 44, height: 160, zIndex: 20, cursor: "ew-resize" };

  // Fade + scale — no directional slide since handles are always inside the image
  // (following Emil: start from 0.85 not 0; nothing appears from nothing)
  const motion_x = isHeight ? "-50%" : 0;
  const motion_y = isHeight ? 0 : "-50%";

  return (
    <AnimatePresence>
      {(show || isResizing) && (
        <motion.div
          key={`${axis}-handle`}
          initial={{ opacity: 0, scale: 0.82, x: motion_x, y: motion_y }}
          animate={{ opacity: 1, scale: 1, x: motion_x, y: motion_y }}
          exit={{ opacity: 0, scale: 0.88, x: motion_x, y: motion_y }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="group/hh pointer-events-auto absolute flex items-center justify-center select-none"
          style={positionStyle}
          onMouseEnter={() => onHoverChange?.(true)}
          onMouseLeave={() => onHoverChange?.(false)}
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pill — pixel copy of the thumbnail handle pill */}
          <div
            className={cn(
              "flex items-center justify-center gap-[6px] rounded-full border border-white/[0.15] transition-all duration-200",
              isHeight ? "w-full flex-row" : "h-full flex-col",
              isResizing
                ? "scale-105 bg-[#0D0D0D]/60 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_24px_rgba(255,255,255,0.22)]"
                : "bg-[#0D0D0D]/50 backdrop-blur-sm group-hover/hh:scale-105 group-hover/hh:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_20px_rgba(255,255,255,0.18)]"
            )}
            style={isHeight ? { height: 12 } : { width: 12 }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full transition-colors duration-200",
                  isResizing ? "bg-white/90" : "bg-white/50 group-hover/hh:bg-white/75"
                )}
                style={{ width: 4, height: 4 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
