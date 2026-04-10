import { useState, useRef, useEffect } from "react";
import { Briefcase, Monitor, Clock, Bookmark, XCircle, Clapperboard } from "lucide-react";
import { Gauge } from "@/components/ui/gauge-1";
import { ColorOrb } from "@/components/ui/color-orb";

export function JobCard({ job, onShortlist, onOpen, onDismiss, onMockInterview, onAskScout }) {
  const [dismissOpen, setDismissOpen] = useState(false);
  const dismissRef = useRef(null);

  useEffect(() => {
    if (!dismissOpen) return;
    const handler = (e) => {
      if (dismissRef.current && !dismissRef.current.contains(e.target)) {
        setDismissOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dismissOpen]);

  return (
    <div
      data-testid={`card-job-${job.id}`}
      className="flex flex-col gap-3 p-3 rounded-lg border border-black/[0.06] bg-white dark:bg-background dark:border-border select-none"
    >
      {/* Row 1: Company logo + name/location + gauge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-[42px] h-[42px] rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[15px] font-bold"
            style={{ backgroundColor: job.logoColor }}
          >
            {job.logoLetter}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-foreground/70 truncate">{job.company}</div>
            <div className="text-[12px] text-foreground/40 truncate">{job.location}</div>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center">
          <Gauge
            value={job.match}
            size={42}
            strokeWidth={8}
            gapPercent={3}
            primary="success"
            secondary="rgba(0,0,0,0.06)"
            showValue={true}
            showPercentage={false}
            transition={{ delay: 200 }}
            className={{ textClassName: "fill-emerald-600 dark:fill-emerald-400" }}
          />
        </div>
      </div>

      {/* Row 2: Title */}
      <button
        onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
        className="text-[15px] font-semibold text-foreground leading-snug text-left hover:text-foreground/60 transition-colors cursor-pointer"
      >
        {job.role}
      </button>

      {/* Row 3: Pills */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/55 bg-black/[0.05] dark:bg-white/[0.06] rounded-md px-1.5 py-0.5 whitespace-nowrap">
          <Briefcase className="w-2.5 h-2.5 flex-shrink-0" />
          {job.type}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/55 bg-black/[0.05] dark:bg-white/[0.06] rounded-md px-1.5 py-0.5 whitespace-nowrap">
          <Monitor className="w-2.5 h-2.5 flex-shrink-0" />
          {job.workMode}
        </span>
        {job.yearsExp && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/55 bg-black/[0.05] dark:bg-white/[0.06] rounded-md px-1.5 py-0.5 whitespace-nowrap">
            <Clock className="w-2.5 h-2.5 flex-shrink-0" />
            {job.yearsExp}
          </span>
        )}
      </div>

      {/* Action buttons */}
      {onShortlist ? (
        <div className="flex items-center gap-1.5">
          {/* Dismiss */}
          <div className="relative flex-shrink-0" ref={dismissRef}>
            <button
              data-testid={`button-dismiss-${job.id}`}
              onClick={(e) => { e.stopPropagation(); setDismissOpen((v) => !v); }}
              className="flex items-center justify-center w-8 h-8 text-foreground/40 bg-black/[0.04] hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-md transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
            {dismissOpen && (
              <div className="absolute bottom-full left-0 mb-1.5 bg-white dark:bg-card rounded-lg shadow-lg border border-black/[0.08] dark:border-border py-1 min-w-[148px] z-50">
                <button
                  onClick={(e) => { e.stopPropagation(); setDismissOpen(false); onDismiss?.(); }}
                  className="w-full text-left px-3 py-2 text-[12px] text-foreground/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
                >
                  Already applied
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDismissOpen(false); onDismiss?.(); }}
                  className="w-full text-left px-3 py-2 text-[12px] text-foreground/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
                >
                  Not Interested
                </button>
              </div>
            )}
          </div>

          {/* Shortlist */}
          <button
            data-testid={`button-shortlist-${job.id}`}
            onClick={(e) => { e.stopPropagation(); onShortlist(); }}
            className="flex items-center justify-center gap-1.5 flex-1 text-[12px] font-semibold text-foreground/50 bg-black/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] rounded-md px-2 py-2 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Shortlist
          </button>

          {/* Ask Scout */}
          {onAskScout && (
            <button
              data-testid={`button-ask-scout-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onAskScout(); }}
              className="orb-activates-on-hover flex items-center justify-center gap-1.5 flex-1 text-[12px] font-semibold text-foreground/65 hover:text-foreground/90 bg-black/[0.04] hover:bg-black/[0.08] rounded-md px-2 py-2 transition-colors"
            >
              <ColorOrb dimension="14px" spinDuration={8} />
              Ask Scout
            </button>
          )}
        </div>
      ) : (
        <>
          {onMockInterview && (
            <button
              data-testid={`button-mock-interview-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onMockInterview(); }}
              className="flex items-center justify-center gap-1.5 w-full text-[12px] font-semibold text-foreground/60 bg-black/[0.04] hover:bg-black/[0.08] rounded-md px-2 py-2 transition-colors"
            >
              <Clapperboard className="w-3.5 h-3.5" />
              Take mock interview
            </button>
          )}
          {onAskScout && (
            <button
              data-testid={`button-ask-scout-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onAskScout(); }}
              className="orb-activates-on-hover flex items-center justify-center gap-1.5 w-full text-[12px] font-semibold text-foreground/65 hover:text-foreground/90 bg-black/[0.04] hover:bg-black/[0.08] rounded-full py-1.5 transition-colors"
            >
              <ColorOrb dimension="14px" spinDuration={8} />
              Ask Scout
            </button>
          )}
        </>
      )}
    </div>
  );
}
