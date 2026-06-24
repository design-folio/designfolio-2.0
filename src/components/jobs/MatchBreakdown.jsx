import { useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, X } from "lucide-react";

// 3 zones — proportional widths: 64% Weak / 20% Strong / 16% Excellent
const ZONES = [
  {
    label: "Weak",
    pct: 64,
    barStart: 0,
    barEnd: 64,
    brightL: "#fca5a5",
    midL: "#ef4444",
    brightD: "#fca5a5",
    midD: "#b91c1c",
    fadedL: "rgba(239,68,68,0.13)",
    fadedD: "rgba(185,28,28,0.14)",
  },
  {
    label: "Strong",
    pct: 20,
    barStart: 64,
    barEnd: 84,
    brightL: "#fde68a",
    midL: "#f97316",
    brightD: "#fde68a",
    midD: "#ea580c",
    fadedL: "rgba(249,115,22,0.13)",
    fadedD: "rgba(234,88,12,0.14)",
  },
  {
    label: "Excellent",
    pct: 16,
    barStart: 84,
    barEnd: 100,
    brightL: "#4ade80",
    midL: "#10b981",
    brightD: "#4ade80",
    midD: "#16a34a",
    fadedL: "rgba(16,185,129,0.13)",
    fadedD: "rgba(22,163,74,0.14)",
  },
];

function scoreToBarPct(score) {
  if (score <= 64) return (score / 64) * 64;
  if (score <= 84) return 64 + ((score - 65) / 19) * 20;
  return 84 + ((score - 85) / 15) * 16;
}

export function MatchBreakdown({ job, open }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [expandedSection, setExpandedSection] = useState(null);

  const s = job.match ?? 0;
  const allAligns = (job.aligns ?? []).slice(0, 3);
  const allGaps = (job.gaps ?? []).slice(0, 3);
  const markerBarPct = Math.max(1, Math.min(98.5, scoreToBarPct(s)));

  const headline =
    s >= 85
      ? "You're an excellent match for this role."
      : s >= 65
        ? "You're a strong match — excellence is within reach."
        : "You're in the mix, with some key areas to work on.";

  return (
    <div
      className="rounded-xl border border-black/[0.06] dark:border-white/[0.07] px-4 pt-4 pb-0 overflow-hidden"
      style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.028)" }}
    >
      <p className="text-[14.5px] font-semibold text-foreground leading-snug mb-4">{headline}</p>

      {/* Zoned bar + YOU marker */}
      <div className="relative mt-7">
        {/* YOU label chip */}
        <div
          className="absolute flex flex-col items-center pointer-events-none"
          style={{
            left: open ? `${markerBarPct}%` : "0%",
            transform: "translateX(-50%)",
            transition: open ? "left 1s cubic-bezier(0.22,1,0.36,1) 0.15s" : "none",
            bottom: "calc(100% + 5px)",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.38)",
              lineHeight: 1,
              userSelect: "none",
              textTransform: "uppercase",
            }}
          >
            you
          </span>
        </div>

        {/* Bar segments */}
        <div className="relative flex h-[14px] rounded-lg overflow-hidden gap-[2px]">
          {ZONES.map((z) => {
            const filledBars = Math.max(0, Math.min(markerBarPct, z.barEnd) - z.barStart);
            const fadedBars = z.pct - filledBars;
            const bright = isDark ? z.brightD : z.brightL;
            const mid = isDark ? z.midD : z.midL;
            const vividGrad = `linear-gradient(to right, ${bright}, ${mid})`;
            const fadedColor = isDark ? z.fadedD : z.fadedL;
            return (
              <div key={z.label} style={{ width: `${z.pct}%`, display: "flex" }}>
                {filledBars > 0 && <div style={{ flex: filledBars, background: vividGrad }} />}
                {fadedBars > 0 && <div style={{ flex: fadedBars, background: fadedColor }} />}
              </div>
            );
          })}

          {/* 3D gloss overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.06) 45%, rgba(0,0,0,0.08) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.14)",
            }}
          />
        </div>

        {/* Tick line */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: open ? `${markerBarPct}%` : "0%",
            transform: "translateX(-50%)",
            transition: open ? "left 1s cubic-bezier(0.22,1,0.36,1) 0.15s" : "none",
            top: -3,
            bottom: -3,
            width: 2.5,
            borderRadius: 2,
            background: isDark ? "rgba(255,255,255,0.70)" : "rgba(0,0,0,0.50)",
            boxShadow: isDark
              ? "0 0 6px 1px rgba(255,255,255,0.22)"
              : "0 0 6px 1px rgba(0,0,0,0.14)",
          }}
        />
      </div>

      {/* Zone labels */}
      <div className="flex mt-1">
        {ZONES.map((z) => (
          <div key={z.label} style={{ width: `${z.pct}%` }}>
            <span className="text-[9.5px] text-foreground/50 whitespace-nowrap">{z.label}</span>
          </div>
        ))}
      </div>

      {/* Signals + Missing accordion — only shown when data is available */}
      {(allAligns.length > 0 || allGaps.length > 0) && (
        <div
          className="mt-3.5 -mx-4 border-t border-black/[0.06] dark:border-white/[0.06] overflow-hidden"
          style={{ background: isDark ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.038)" }}
        >
          {allAligns.length > 0 && (
            <>
              <button
                onClick={() => setExpandedSection(expandedSection === "signals" ? null : "signals")}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.09] transition-colors duration-150"
              >
                <span className="text-[9.5px] font-semibold uppercase tracking-widest text-foreground/40">
                  Strongest signals
                </span>
                <ChevronDown
                  className="w-3 h-3 text-foreground/30 transition-transform duration-200 flex-shrink-0"
                  style={{
                    transform: expandedSection === "signals" ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              <AnimatePresence initial={false}>
                {expandedSection === "signals" && (
                  <motion.div
                    key="signals-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <ul className="px-3 pb-2.5 space-y-1.5">
                      {allAligns.map((a) => (
                        <li key={a} className="flex items-start gap-2">
                          <Check className="w-3 h-3 mt-[2px] text-foreground/40 flex-shrink-0" />
                          <span className="text-[11.5px] text-foreground/60 leading-snug">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {allAligns.length > 0 && allGaps.length > 0 && (
            <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />
          )}

          {allGaps.length > 0 && (
            <>
              <button
                onClick={() => setExpandedSection(expandedSection === "missing" ? null : "missing")}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left cursor-pointer hover:bg-black/[0.06] dark:hover:bg-white/[0.09] transition-colors duration-150"
              >
                <span className="text-[9.5px] font-semibold uppercase tracking-widest text-foreground/40">
                  Missing
                </span>
                <ChevronDown
                  className="w-3 h-3 text-foreground/30 transition-transform duration-200 flex-shrink-0"
                  style={{
                    transform: expandedSection === "missing" ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              <AnimatePresence initial={false}>
                {expandedSection === "missing" && (
                  <motion.div
                    key="missing-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <ul className="px-3 pb-2.5 space-y-1.5">
                      {allGaps.map((g) => (
                        <li key={g} className="flex items-start gap-2">
                          <X className="w-3 h-3 mt-[2px] text-foreground/30 flex-shrink-0" />
                          <span className="text-[11.5px] text-foreground/45 leading-snug">{g}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </div>
  );
}
