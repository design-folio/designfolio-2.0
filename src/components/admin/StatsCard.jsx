import { useEffect, useState } from "react";
import { Info, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (prefersReducedMotion || target === 0) {
      queueMicrotask(() => setValue(target));
      return;
    }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, prefersReducedMotion]);

  return value;
}

function DeltaBadge({ delta, label }) {
  if (delta === null || delta === undefined) return null;
  const isPos = delta > 0;
  const isNeg = delta < 0;
  const abs = Math.abs(delta).toFixed(1);
  return (
    <div
      className={cn(
        "mt-1.5 inline-flex items-center gap-0.5 font-mono text-[10px] leading-none",
        isPos
          ? "text-emerald-500 dark:text-emerald-400"
          : isNeg
            ? "text-red-500 dark:text-red-400"
            : "text-[#B5AFA5] dark:text-[#5A544E]"
      )}
      aria-label={`${isPos ? "Up" : isNeg ? "Down" : "No change"} ${abs}% ${label}`}
    >
      {isPos && <TrendingUp size={9} aria-hidden="true" />}
      {isNeg && <TrendingDown size={9} aria-hidden="true" />}
      <span>
        {isPos ? "+" : isNeg ? "–" : ""}
        {abs}%
      </span>
      <span className="ml-0.5 text-[#B5AFA5] dark:text-[#5A544E]">{label}</span>
    </div>
  );
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  suffix = "",
  index = 0,
  subText,
  info,
  smartText,
  wide = false,
  delta,
  deltaLabel,
}) {
  const displayValue = useCountUp(typeof value === "number" ? value : 0);

  const formatted =
    suffix === "%"
      ? `${value}%`
      : typeof value === "string"
        ? value
        : displayValue.toLocaleString();

  if (wide) {
    return (
      <TooltipProvider>
        <div
          className={cn(
            "h-full rounded-2xl border border-[#E5D7C4] bg-white px-5 py-4 dark:border-white/10 dark:bg-[#2A2520]",
            "transition-[transform,box-shadow] duration-150 ease-out",
            "hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
            "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards duration-300",
            "flex items-center"
          )}
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div className="flex w-full items-center gap-3">
            {Icon && (
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EDE7] dark:bg-[#231F1A]"
                aria-hidden="true"
              >
                <Icon size={18} className="text-[#7A736C] dark:text-[#B5AFA5]" />
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <p className="font-manrope text-sm leading-none text-[#7A736C] dark:text-[#B5AFA5]">
                {label}
              </p>
              {info && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-[#B5AFA5] transition-colors duration-150 hover:text-[#7A736C] focus-visible:outline-none dark:hover:text-[#D5CFC5]"
                      aria-label={`Info: ${label}`}
                    >
                      <Info size={12} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                    {info}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="ml-auto text-right">
              <p
                className="font-dm-mono text-2xl font-medium tracking-tight text-[#1A1A1A] tabular-nums dark:text-[#F0EDE7]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatted}
              </p>
              {subText && (
                <p className="font-manrope mt-0.5 text-xs leading-none text-[#7A736C] dark:text-[#B5AFA5]">
                  {subText}
                </p>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "rounded-2xl border border-[#E5D7C4] bg-white p-5 dark:border-white/10 dark:bg-[#2A2520]",
          "transition-[transform,box-shadow] duration-150 ease-out",
          "hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
          "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards h-full duration-300"
        )}
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-1.5">
              <p className="font-manrope text-sm leading-none text-[#7A736C] dark:text-[#B5AFA5]">
                {label}
              </p>
              {info && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-[#B5AFA5] transition-colors duration-150 hover:text-[#7A736C] focus-visible:outline-none dark:hover:text-[#D5CFC5]"
                      aria-label={`Info: ${label}`}
                    >
                      <Info size={12} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                    {info}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p
              className="font-dm-mono text-3xl font-medium tracking-tight text-[#1A1A1A] tabular-nums dark:text-[#F0EDE7]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatted}
            </p>
            {subText && (
              <p className="font-manrope mt-1.5 text-xs leading-none text-[#7A736C] dark:text-[#B5AFA5]">
                {subText}
              </p>
            )}
            {smartText && (
              <p className="font-manrope mt-2 text-xs leading-snug text-[#7A736C] italic dark:text-[#B5AFA5]">
                {smartText}
              </p>
            )}
            <DeltaBadge delta={delta} label={deltaLabel} />
          </div>
          {Icon && (
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EDE7] dark:bg-[#231F1A]"
              aria-hidden="true"
            >
              <Icon size={18} className="text-[#7A736C] dark:text-[#B5AFA5]" />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
