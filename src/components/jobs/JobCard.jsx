import { useState } from "react";
import { useTheme } from "next-themes";
import { Bookmark, Clapperboard, Maximize2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge } from "@/components/ui/gauge-1";
import { ColorOrb } from "@/components/ui/color-orb";
import { CompanyLogo } from "./CompanyLogo";

const EASING = [0.23, 1, 0.32, 1];

function getScoreColor(score) {
  if (score >= 85) return "#18A360";
  if (score >= 65) return "#F5A623";
  return "#E5534B";
}

function AnalyzingRing({ isDark }) {
  const track  = isDark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.07)";
  const arc    = isDark ? "rgba(255,255,255,0.22)"  : "rgba(0,0,0,0.18)";

  return (
    <div className="relative w-[40px] h-[40px] flex-shrink-0 mt-0.5">
      {/* Static track ring */}
      <svg width="40" height="40" viewBox="0 0 100 100" className="absolute inset-0" fill="none">
        <circle cx="50" cy="50" r="46.5" strokeWidth="7" stroke={track} strokeLinecap="round" />
      </svg>
      {/* Spinning arc — whole SVG rotates so transform-origin:center is guaranteed */}
      <svg
        width="40" height="40" viewBox="0 0 100 100"
        className="absolute inset-0"
        fill="none"
        style={{ animation: "spin 1.4s linear infinite" }}
      >
        <circle
          cx="50" cy="50" r="46.5"
          strokeWidth="7"
          stroke={arc}
          strokeLinecap="round"
          strokeDasharray="73 219.2"
        />
      </svg>
    </div>
  );
}

export function JobCard({ job, onShortlist, onOpen, onDismiss, onMockInterview, onAskScout, joyrideActive = false, joyrideFirst = false }) {
  const [tooltipVisible, setTooltipVisible] = useState(joyrideFirst);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAnalyzing = job.match === null;

  return (
    <div
      data-testid={`card-job-${job.id}`}
      className="job-card relative flex flex-col gap-3 p-3 rounded-xl border border-black/[0.04] dark:border-[#302B28] bg-white dark:bg-[#28231E] select-none shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition-all duration-150 hover:-translate-y-0.5 hover:border-black/[0.1] dark:hover:border-[#4A4440] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.55)]"
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-foreground/20 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 pointer-events-none" />

      {/* Row 1: Logo + Role/Company·Location + Gauge */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <CompanyLogo logoUrl={job.logoUrl} company={job.company} size={40} />
          <div className="min-w-0 flex-1">
            {isAnalyzing ? (
              /* Non-interactive title when unscored */
              <div className="text-[15px] font-semibold text-foreground/50 leading-snug w-full">
                {job.role}
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
                className="text-[15px] font-semibold text-foreground leading-snug text-left hover:text-foreground/60 transition-colors cursor-pointer w-full"
              >
                {job.role}
              </button>
            )}
            <div className="text-[12px] text-foreground/45 mt-0.5 truncate">
              {job.company}
            </div>
          </div>
        </div>

        {/* Score gauge — null=pending ring, number=gauge, undefined=no score (pipeline) */}
        <AnimatePresence mode="wait" initial={false}>
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18, ease: EASING }}
            >
              <AnalyzingRing isDark={isDark} />
            </motion.div>
          ) : job.match !== undefined ? (
            <motion.div
              key="scored"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.26, ease: EASING }}
              className="flex-shrink-0 mt-0.5"
            >
              <Gauge
                value={job.match}
                size={40}
                strokeWidth={7}
                gapPercent={3}
                primary={getScoreColor(job.match)}
                secondary={isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.13)"}
                showValue={true}
                showPercentage={false}
                transition={{ delay: 200 }}
                className={{ textClassName: isDark ? "fill-white" : "fill-[#1A1A1A]" }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Row 2: Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center font-jetbrains-mono text-[10px] font-semibold uppercase tracking-wide text-[#3D3630] dark:text-white/55 bg-[#EAE5DF] dark:bg-[#1F1C1C] rounded-md px-2 py-1 whitespace-nowrap">
          {job.location}
        </span>
        <span className="inline-flex items-center font-jetbrains-mono text-[10px] font-semibold uppercase tracking-wide text-[#3D3630] dark:text-white/55 bg-[#EAE5DF] dark:bg-[#1F1C1C] rounded-md px-2 py-1 whitespace-nowrap">
          {job.type}
        </span>
        <span className="inline-flex items-center font-jetbrains-mono text-[10px] font-semibold uppercase tracking-wide text-[#3D3630] dark:text-white/55 bg-[#EAE5DF] dark:bg-[#1F1C1C] rounded-md px-2 py-1 whitespace-nowrap">
          {job.workMode}
        </span>
      </div>

      {/* Joyride tooltip — dark pill with downward caret pointing at Shortlist button */}
      {tooltipVisible && (
        <div
          className="flex items-start !cursor-default"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-[11px] font-medium pl-3 pr-1.5 py-1.5 rounded-lg leading-none whitespace-nowrap">
              Shortlist jobs you want to track →
              <button
                onClick={(e) => { e.stopPropagation(); setTooltipVisible(false); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 dark:hover:bg-black/10 transition-colors flex-shrink-0 !cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="absolute left-4 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1a1a1a] dark:border-t-white" />
          </div>
        </div>
      )}

      {/* Action row */}
      {onShortlist ? (
        <div className="flex items-center gap-1.5">
          <button
            data-testid={`button-shortlist-${job.id}`}
            onClick={(e) => { e.stopPropagation(); onShortlist(); }}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors${joyrideActive ? " joyride-btn-glow" : ""}`}
          >
            <Bookmark className="w-3 h-3" />
            Shortlist
          </button>

          {onAskScout && !isAnalyzing && (
            <button
              data-testid={`button-ask-scout-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onAskScout(); }}
              className="orb-activates-on-hover flex items-center gap-1.5 h-8 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors"
            >
              <ColorOrb dimension="12px" spinDuration={8} />
              Ask Scout
            </button>
          )}

          <div className="ml-auto">
            {isAnalyzing ? (
              /* Analyzing state — non-interactive spinner in place of expand */
              <div className="flex items-center justify-center w-7 h-7 text-foreground/20 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "1.8s" }} />
              </div>
            ) : (
              <button
                data-testid={`button-expand-${job.id}`}
                onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
                className="flex items-center justify-center w-7 h-7 text-foreground/30 hover:text-foreground/60 transition-colors rounded-full"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {onMockInterview && !isAnalyzing && (
            <button
              data-testid={`button-mock-interview-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onMockInterview(); }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors"
            >
              <Clapperboard className="w-3 h-3" />
              Mock interview
            </button>
          )}

          {onAskScout && !isAnalyzing && (
            <button
              data-testid={`button-ask-scout-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onAskScout(); }}
              className="orb-activates-on-hover flex items-center gap-1.5 h-8 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors"
            >
              <ColorOrb dimension="12px" spinDuration={8} />
              Ask Scout
            </button>
          )}

          <div className="ml-auto">
            {isAnalyzing ? (
              <div className="flex items-center justify-center w-7 h-7 text-foreground/20 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "1.8s" }} />
              </div>
            ) : (
              <button
                data-testid={`button-expand-other-${job.id}`}
                onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
                className="flex items-center justify-center w-7 h-7 text-foreground/30 hover:text-foreground/60 transition-colors rounded-full"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Analyzing label — fades in below action row */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASING }}
            className="overflow-hidden"
          >
            <p className="text-[10px] font-jetbrains-mono text-foreground/30 tracking-wide text-center pb-0.5">
              Analyzing match score…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
