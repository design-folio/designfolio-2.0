import { useState } from "react";
import { useTheme } from "next-themes";
import { Bookmark, Clapperboard, Maximize2, Loader2, X, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ColorOrb } from "@/components/ui/color-orb";
import { CompanyLogo } from "./CompanyLogo";
import { ScoreGauge } from "./ScoreGauge";

const MOVE_COLS = [
  { id: "saved", label: "Shortlisted" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "archived", label: "Archived" },
];

const EASING = [0.23, 1, 0.32, 1];

function AnalyzingRing({ isDark }) {
  const track = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const arc = isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)";

  return (
    <div className="relative w-[40px] h-[40px] flex-shrink-0 mt-0.5">
      <svg width="40" height="40" viewBox="0 0 100 100" className="absolute inset-0" fill="none">
        <circle cx="50" cy="50" r="46.5" strokeWidth="7" stroke={track} strokeLinecap="round" />
      </svg>
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        className="absolute inset-0"
        fill="none"
        style={{ animation: "spin 1.4s linear infinite" }}
      >
        <circle
          cx="50"
          cy="50"
          r="46.5"
          strokeWidth="7"
          stroke={arc}
          strokeLinecap="round"
          strokeDasharray="73 219.2"
        />
      </svg>
    </div>
  );
}

const PILL_BTN =
  "flex items-center gap-1.5 h-8 px-2 md:px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-[transform,color,border-color,background-color] duration-150 active:scale-[0.97]";

export function JobCard({
  job,
  onShortlist,
  onOpen,
  onDismiss,
  onMockInterview,
  onAskScout,
  onMoveTo,
  currentColId,
  joyrideActive = false,
  joyrideFirst = false,
}) {
  const [tooltipVisible, setTooltipVisible] = useState(joyrideFirst);
  const [gaugeHovered, setGaugeHovered] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isAnalyzing = job.match === null;

  const gaugeAligns = (job.aligns ?? []).slice(0, 3);
  const gaugeGaps = (job.gaps ?? []).slice(0, 2);
  const hasPopover = gaugeAligns.length > 0 || gaugeGaps.length > 0;

  return (
    <div
      data-testid={`card-job-${job.id}`}
      className="job-card relative flex flex-col gap-3 p-3 rounded-xl border border-black/[0.04] dark:border-[#302B28] bg-white dark:bg-[#28231E] select-none
        shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4)]
        transition-[transform,box-shadow,border-color] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]
        hover:-translate-y-1 hover:z-10 hover:border-black/[0.1] dark:hover:border-[#4A4440] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.55)]
        active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:active:shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
    >
      {/* Row 1: Logo + Role/Company + Gauge */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <CompanyLogo logoUrl={job.logoUrl} company={job.company} size={40} />
          <div className="min-w-0 flex-1">
            {isAnalyzing ? (
              <div className="text-[15px] font-semibold text-foreground/50 leading-snug w-full">
                {job.role}
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen?.();
                }}
                className="text-[15px] font-semibold text-foreground leading-snug text-left hover:text-foreground/60 active:text-foreground/40 transition-colors duration-100 cursor-pointer w-full"
              >
                {job.role}
              </button>
            )}
            <div className="text-[12px] text-foreground/45 mt-0.5 truncate">{job.company}</div>
          </div>
        </div>

        {/* Score gauge — null=pending ring, number=gauge, undefined=no score */}
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
              className="relative flex-shrink-0 mt-0.5"
              onMouseEnter={() => setGaugeHovered(true)}
              onMouseLeave={() => setGaugeHovered(false)}
            >
              <ScoreGauge value={job.match} isDark={isDark} />

              {/* Hover popover with aligns/gaps */}
              {hasPopover && (
                <div
                  className="absolute right-full top-0 mr-2 z-50 pointer-events-none"
                  style={{
                    opacity: gaugeHovered ? 1 : 0,
                    transform: gaugeHovered ? "translateY(0)" : "translateY(4px)",
                    transition: "opacity 0.18s ease, transform 0.18s ease",
                  }}
                >
                  <div
                    className="w-[172px] rounded-xl border border-black/[0.07] dark:border-white/[0.09] px-3 py-2.5 flex flex-col gap-2"
                    style={{
                      background: isDark ? "rgba(30,26,22,0.97)" : "rgba(255,255,255,0.97)",
                      boxShadow: isDark
                        ? "0 4px 20px rgba(0,0,0,0.45)"
                        : "0 4px 20px rgba(0,0,0,0.10)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {gaugeAligns.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {gaugeAligns.map((a) => (
                          <div key={a} className="flex items-start gap-1.5">
                            <Check className="w-2.5 h-2.5 mt-[2px] flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-[11px] text-foreground/65 leading-snug">{a}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {gaugeAligns.length > 0 && gaugeGaps.length > 0 && (
                      <div className="h-px bg-black/[0.06] dark:bg-white/[0.07]" />
                    )}
                    {gaugeGaps.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {gaugeGaps.map((g) => (
                          <div key={g} className="flex items-start gap-1.5">
                            <X className="w-2.5 h-2.5 mt-[2px] flex-shrink-0 text-foreground/30" />
                            <span className="text-[11px] text-foreground/40 leading-snug">{g}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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

      {/* Joyride tooltip */}
      {tooltipVisible && (
        <div
          className="flex items-start !cursor-default"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-[11px] font-medium pl-3 pr-1.5 py-1.5 rounded-lg leading-none whitespace-nowrap">
              Shortlist jobs you want to track →
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTooltipVisible(false);
                }}
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
            onClick={(e) => {
              e.stopPropagation();
              onShortlist();
            }}
            className={`${PILL_BTN}${joyrideActive ? " joyride-btn-glow" : ""}`}
          >
            <Bookmark className="w-3 h-3" />
            Shortlist
          </button>

          {onAskScout && !isAnalyzing && (
            <button
              data-testid={`button-ask-scout-${job.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAskScout();
              }}
              className={`orb-activates-on-hover ${PILL_BTN}`}
            >
              <ColorOrb dimension="12px" spinDuration={8} />
              Ask Scout
            </button>
          )}

          <div className="ml-auto">
            {isAnalyzing ? (
              <div className="flex items-center justify-center w-7 h-7 text-foreground/20 rounded-full">
                <Loader2
                  className="w-3.5 h-3.5 animate-spin"
                  style={{ animationDuration: "1.8s" }}
                />
              </div>
            ) : (
              <button
                data-testid={`button-expand-${job.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen?.();
                }}
                className="flex items-center justify-center w-7 h-7 text-foreground/30 hover:text-foreground/60 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-[transform,color,background-color] duration-100 active:scale-[0.88] rounded-full"
              >
                <Maximize2 className="w-3.5 h-3.5 pointer-events-none" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {onMockInterview && !isAnalyzing && (
            <button
              data-testid={`button-mock-interview-${job.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onMockInterview();
              }}
              className={PILL_BTN}
            >
              <Clapperboard className="w-3 h-3" />
              <span className="hidden md:inline">Mock interview</span>
            </button>
          )}

          {onAskScout && !isAnalyzing && (
            <button
              data-testid={`button-ask-scout-${job.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAskScout();
              }}
              className={`orb-activates-on-hover ${PILL_BTN}`}
            >
              <ColorOrb dimension="12px" spinDuration={8} />
              Ask Scout
            </button>
          )}

          {onMoveTo && !isAnalyzing && (
            <Popover open={moveOpen} onOpenChange={setMoveOpen}>
              <PopoverTrigger asChild>
                <button className={`md:hidden ${PILL_BTN}`} onClick={(e) => e.stopPropagation()}>
                  <ArrowRight className="w-3 h-3" />
                  Move to
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                sideOffset={6}
                collisionPadding={12}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="w-[176px] p-1.5 rounded-2xl border border-black/[0.08] dark:border-border shadow-xl bg-white dark:bg-card"
              >
                {MOVE_COLS.filter((c) => c.id !== currentColId).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTo(id);
                      setMoveOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05] active:bg-foreground/[0.08] transition-colors text-left"
                  >
                    {label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          <div className="ml-auto">
            {isAnalyzing ? (
              <div className="flex items-center justify-center w-7 h-7 text-foreground/20 rounded-full">
                <Loader2
                  className="w-3.5 h-3.5 animate-spin"
                  style={{ animationDuration: "1.8s" }}
                />
              </div>
            ) : (
              <button
                data-testid={`button-expand-other-${job.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen?.();
                }}
                className="flex items-center justify-center w-7 h-7 text-foreground/30 hover:text-foreground/60 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-[transform,color,background-color] duration-100 active:scale-[0.88] rounded-full"
              >
                <Maximize2 className="w-3.5 h-3.5 pointer-events-none" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Analyzing label */}
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
