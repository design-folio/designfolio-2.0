import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ColorOrb } from '@/components/ui/color-orb';
import { _getJobCredits } from '@/network/jobs';
import { JOB_CREDITS } from '@/data/jobCredits';

export function CreditsWidget({ refreshKey = 0 }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    _getJobCredits()
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [refreshKey]);

  const balance = data?.balance ?? null;
  const isLow   = balance !== null && balance <= 20;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="orb-activates-on-hover flex-shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-black/[0.08] dark:border-border bg-white dark:bg-card text-[12px] font-medium text-foreground/60 select-none cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors data-[state=open]:bg-black/[0.03] dark:data-[state=open]:bg-white/[0.04] data-[state=open]:border-black/[0.14] dark:data-[state=open]:border-white/[0.15]">
            <ColorOrb dimension="12px" spinDuration={8} className="cursor-pointer" />
            {balance !== null ? (
              <span>
                <span className={isLow ? 'text-amber-500 dark:text-amber-400 font-semibold' : ''}>
                  {balance}
                </span>
                <span className="text-foreground/35"> credits</span>
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
          className="p-3 rounded-xl w-56 space-y-2.5 border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-card shadow-lg"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold text-foreground/70">Credit Balance</span>
            <span className={`text-[13px] font-bold ${isLow ? 'text-amber-500 dark:text-amber-400' : 'text-foreground'}`}>
              {balance ?? '—'}
            </span>
          </div>
          <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-2 space-y-1.5">
            {Object.entries(JOB_CREDITS).map(([type, meta]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-[11px] text-foreground/55">{meta.label}</span>
                <span className="text-[11px] font-medium text-foreground/40">
                  {meta.cost === 1 ? '1 credit' : `${meta.cost} cr`}
                </span>
              </div>
            ))}
          </div>
          {isLow && (
            <p className="text-[10px] text-amber-500 dark:text-amber-400 pt-0.5">
              Running low — consider upgrading your plan.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
