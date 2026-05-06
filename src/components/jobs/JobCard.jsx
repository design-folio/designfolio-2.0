import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Bookmark, Clapperboard, Maximize2 } from "lucide-react";
import { Gauge } from "@/components/ui/gauge-1";
import { ColorOrb } from "@/components/ui/color-orb";
import { CompanyLogo } from "./CompanyLogo";

function getScoreColor(score) {
  if (score >= 85) return "#18A360";
  if (score >= 70) return "#F5A623";
  return "#E5534B";
}

export function JobCard({ job, onShortlist, onOpen, onDismiss, onMockInterview, onAskScout }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
            <button
              onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
              className="text-[15px] font-semibold text-foreground leading-snug text-left hover:text-foreground/60 transition-colors cursor-pointer w-full"
            >
              {job.role}
            </button>
            <div className="text-[12px] text-foreground/45 mt-0.5 truncate">
              {job.company} · {job.location}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 mt-0.5">
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
        </div>
      </div>

      {/* Row 2: Tags — JetBrains Mono, uppercase, no icons */}
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

      {/* Action row */}
      {onShortlist ? (
        <div className="flex items-center gap-1.5">
          <button
            data-testid={`button-shortlist-${job.id}`}
            onClick={(e) => { e.stopPropagation(); onShortlist(); }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors"
          >
            <Bookmark className="w-3 h-3" />
            Shortlist
          </button>

          {onAskScout && (
            <button
              data-testid={`button-ask-scout-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onAskScout(); }}
              className="orb-activates-on-hover flex items-center gap-1.5 h-8 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors"
            >
              <ColorOrb dimension="12px" spinDuration={8} />
              Ask Scout
            </button>
          )}

          <button
            data-testid={`button-expand-${job.id}`}
            onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
            className="ml-auto flex items-center justify-center w-7 h-7 text-foreground/30 hover:text-foreground/60 transition-colors rounded-full"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {onMockInterview && (
            <button
              data-testid={`button-mock-interview-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onMockInterview(); }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors"
            >
              <Clapperboard className="w-3 h-3" />
              Mock interview
            </button>
          )}

          {onAskScout && (
            <button
              data-testid={`button-ask-scout-${job.id}`}
              onClick={(e) => { e.stopPropagation(); onAskScout(); }}
              className="orb-activates-on-hover flex items-center gap-1.5 h-8 px-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] text-[12px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.15] dark:hover:border-white/[0.18] transition-colors"
            >
              <ColorOrb dimension="12px" spinDuration={8} />
              Ask Scout
            </button>
          )}

          <button
            data-testid={`button-expand-other-${job.id}`}
            onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
            className="ml-auto flex items-center justify-center w-7 h-7 text-foreground/30 hover:text-foreground/60 transition-colors rounded-full"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
