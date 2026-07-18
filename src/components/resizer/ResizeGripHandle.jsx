import { cn } from "@/lib/utils";

/**
 * Presentational left/right resize grip (vertical 3-dot pill) used by ContainerResizer.
 * Purely visual + event forwarding — all drag state lives in the parent.
 */
export default function ResizeGripHandle({ side, active, visible, onMouseDown, onHoverChange }) {
  return (
    <div
      className={cn(
        "group absolute top-0 z-[60] hidden h-40 w-7 items-center justify-center select-none lg:flex",
        side === "left" ? "-left-7" : "-right-7",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      // cursor set inline (not via `cursor-ew-resize`): globals.scss has an unlayered
      // `* { cursor: inherit }` that beats Tailwind's layered cursor utilities. Inline
      // style wins — same approach as ResizeHandle.jsx.
      style={{ cursor: "ew-resize", transition: "opacity 0.2s ease" }}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onMouseDown={(e) => onMouseDown?.(e, side)}
    >
      {/* Pill — pixel copy of the section-image resize handle (ResizeHandle.jsx) */}
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center gap-[6px] rounded-full border border-white/[0.15] transition-all duration-200",
          active
            ? "scale-105 bg-[#0D0D0D]/60 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_24px_rgba(255,255,255,0.22)]"
            : "bg-[#0D0D0D]/50 backdrop-blur-sm group-hover:scale-105 group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_20px_rgba(255,255,255,0.18)]"
        )}
        style={{ width: 12 }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-colors duration-200",
              active ? "bg-white/90" : "bg-white/50 group-hover:bg-white/75"
            )}
            style={{ width: 4, height: 4 }}
          />
        ))}
      </div>
    </div>
  );
}
