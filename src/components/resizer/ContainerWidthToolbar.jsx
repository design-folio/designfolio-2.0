import { cn } from "@/lib/utils";

const fmt = (w) => (w >= 1000 ? `${w / 1000}k` : `${w}`);

/**
 * Floating dark pill for ContainerResizer: preset width chips (hover) or the live width
 * badge (while dragging). Presentational — the parent owns width state + persistence.
 */
export default function ContainerWidthToolbar({
  width,
  presets,
  maxWidth,
  isResizing,
  visible,
  onSelect,
}) {
  const chip = (label, w, active) => (
    <button
      key={label}
      onClick={() => onSelect(w)}
      className={cn(
        "rounded-full px-3 py-[5px] text-[11px] font-semibold whitespace-nowrap transition-all duration-200 select-none",
        active
          ? "bg-white text-[#0D0D0D] shadow-sm"
          : "text-white/45 hover:bg-white/[0.07] hover:text-white/80"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex justify-center">
      <div
        className={cn(
          "pointer-events-auto flex -translate-y-1/2 items-center gap-px rounded-full border border-white/10 bg-[#0D0D0D]/85 px-1.5 py-1.5 shadow-2xl shadow-black/40 backdrop-blur-md transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        {isResizing ? (
          <span className="flex items-center gap-2 px-3.5 py-1.5 text-[12px] font-semibold text-white">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-indigo-400" />
            </span>
            {width}px
          </span>
        ) : (
          <>
            {presets.map((w) => chip(fmt(w), w, width === w))}
            <div className="mx-1 h-4 w-px bg-white/10" />
            {chip("max", maxWidth, width === maxWidth)}
          </>
        )}
      </div>
    </div>
  );
}
