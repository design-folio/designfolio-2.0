import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ColorOrb } from "@/components/ui/color-orb";
import { _getJobCredits } from "@/network/jobs";
import { JOB_CREDITS } from "@/data/jobCredits";

export function CreditsWidget({ refreshKey = 0 }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    _getJobCredits()
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const scout = data?.jobScout;
  const scoutLeft = scout ? scout.limit - scout.used : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="orb-activates-on-hover flex-shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-black/[0.08] dark:border-border bg-white dark:bg-card text-[12px] font-medium text-foreground/60 select-none cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors data-[state=open]:bg-black/[0.03] dark:data-[state=open]:bg-white/[0.04] data-[state=open]:border-black/[0.14] dark:data-[state=open]:border-white/[0.15]">
            <ColorOrb dimension="12px" spinDuration={8} className="cursor-pointer" />
            {scoutLeft !== null ? (
              <span>
                <span className={scoutLeft <= 5 ? "text-amber-500 dark:text-amber-400 font-semibold" : ""}>
                  {scoutLeft}
                </span>
                <span className="text-foreground/35 cursor-pointer"> scout left</span>
              </span>
            ) : (
              <span className="text-foreground/30">Credits</span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="p-3 rounded-xl w-52 space-y-2 border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-card shadow-lg"
        >
          {Object.entries(JOB_CREDITS).map(([type, meta]) => {
            const row = data?.[type];
            const used = row?.used ?? 0;
            const limit = row?.limit ?? meta.limit;
            const pct = limit > 0 ? (used / limit) * 100 : 0;
            return (
              <div key={type}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-foreground/70 font-medium">{meta.label}</span>
                  <span className="text-foreground/50">{used}/{limit} <span className="text-foreground/30">today</span></span>
                </div>
                <div className="h-1 rounded-full bg-black/[0.07] dark:bg-white/[0.07] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-amber-400" : "bg-foreground/25"}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-foreground/30 pt-1">Limits reset daily at midnight</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
