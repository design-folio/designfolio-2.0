import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const keyframes = `
  @keyframes bubble-rise {
    0%   { transform: translateY(0) scale(1); opacity: 0.4; }
    100% { transform: translateY(-100px) scale(0); opacity: 0; }
  }
`;

const BUBBLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  width: Math.random() * 12 + 4,
  height: Math.random() * 12 + 4,
  left: Math.random() * 95,
  duration: 2 + Math.random() * 3,
  delay: Math.random() * 4,
}));

const Bubbles = () => (
  <>
    <style>{keyframes}</style>
    <div className="absolute inset-0 z-[5] overflow-hidden rounded-full pointer-events-none">
      {BUBBLES.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-10px] block rounded-full bg-black/20 dark:bg-white/20 [animation-play-state:paused] group-hover:[animation-play-state:running]"
          style={{
            width: `${b.width}px`,
            height: `${b.height}px`,
            left: `${b.left}%`,
            animation: `bubble-rise ${b.duration}s ${b.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  </>
);

const UsageBadge = React.forwardRef(
  ({ icon, planName, usage, limit, tooltipContent, className }, ref) => {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={ref}
              className={cn(
                "group relative inline-flex cursor-default items-center gap-2 overflow-hidden rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-card px-4 h-9 text-sm font-medium text-foreground transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                className
              )}
            >
              <Bubbles />
              <div className="relative z-10 shrink-0">{icon}</div>
              <div className="relative z-10 whitespace-nowrap">
                <span>{planName}:</span>
                <span className="ml-1.5 font-semibold">{usage}</span>
                {limit != null && <span className="ml-0.5 opacity-50 text-xs">/ {limit}</span>}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            sideOffset={8}
            className="max-w-xs text-center text-primary-foreground bg-primary text-xs rounded-md"
          >
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

UsageBadge.displayName = "UsageBadge";

export { UsageBadge };
