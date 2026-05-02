import { useEffect, useState } from 'react';
import { ColorOrb } from '@/components/ui/color-orb';
import { _getJobCredits } from '@/network/jobs';

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
    <div className="orb-always-active flex-shrink-0 flex items-center gap-2 h-9 px-3 rounded-full border border-black/[0.08] dark:border-border bg-white dark:bg-card select-none cursor-default">
      <ColorOrb dimension="12px" spinDuration={8} />
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-medium text-foreground/35 uppercase tracking-wide">AI Credits</span>
        <span className={`text-[12px] font-semibold ${isLow ? 'text-amber-500 dark:text-amber-400' : 'text-foreground/70'}`}>
          {balance !== null ? balance : '—'}
          {isLow && balance !== null && (
            <span className="text-[9px] font-normal text-amber-400/80 ml-1">low</span>
          )}
        </span>
      </div>
    </div>
  );
}
