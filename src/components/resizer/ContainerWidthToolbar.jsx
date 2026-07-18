import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const fmt = (w) => (w >= 1000 ? `${w / 1000}k` : `${w}`);

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
    <div className="relative w-full">
      {/* Live width badge — while dragging */}
      <AnimatePresence>
        {isResizing && (
          <motion.div
            key="width-badge"
            initial={{ opacity: 0, scale: 0.88, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 3 }}
            transition={{ type: "spring", stiffness: 440, damping: 28 }}
            className="absolute inset-x-0 top-0 flex justify-center"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-[#0D0D0D]/92 px-3.5 py-1.5 text-white shadow-2xl shadow-black/40 backdrop-blur-md">
              <span className="relative flex h-[7px] w-[7px] flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-indigo-400" />
              </span>
              <span
                className="text-[12px] font-semibold tracking-wide"
                style={{ fontFamily: "Geist Mono, DM Mono, monospace" }}
              >
                {width}px
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset width chips — on hover, when not dragging */}
      <AnimatePresence>
        {visible && !isResizing && (
          <motion.div
            key="viewport-toolbar"
            initial={{ opacity: 0, y: -6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute inset-x-0 top-0 flex justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-px rounded-full border border-white/[0.08] bg-[#0D0D0D]/82 px-1.5 py-1.5 shadow-2xl shadow-black/30 backdrop-blur-md">
              {presets.map((w) => chip(fmt(w), w, width === w))}
              <div className="mx-1 h-4 w-px bg-white/[0.08]" />
              {chip("max", maxWidth, width === maxWidth)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
