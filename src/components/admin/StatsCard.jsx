import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (prefersReducedMotion || target === 0) {
      setValue(target);
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

export default function StatsCard({ label, value, icon: Icon, suffix = "", index = 0 }) {
  const displayValue = useCountUp(typeof value === "number" ? value : 0);

  const formatted =
    suffix === "%"
      ? `${value}%`
      : typeof value === "string"
      ? value
      : displayValue.toLocaleString();

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#2A2520] rounded-2xl border border-[#E5D7C4] dark:border-white/10 p-5",
        "transition-[transform,box-shadow] duration-150 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 fill-mode-backwards"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-[#7A736C] dark:text-[#B5AFA5] leading-none mb-2">
            {label}
          </p>
          <p
            className="text-3xl font-semibold tabular-nums tracking-tight text-[#1A1A1A] dark:text-[#F0EDE7]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatted}
          </p>
        </div>
        {Icon && (
          <div
            className="shrink-0 w-9 h-9 rounded-xl bg-[#F0EDE7] dark:bg-[#231F1A] flex items-center justify-center"
            aria-hidden="true"
          >
            <Icon size={18} className="text-[#7A736C] dark:text-[#B5AFA5]" />
          </div>
        )}
      </div>
    </div>
  );
}
