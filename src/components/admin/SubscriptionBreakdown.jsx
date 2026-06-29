import { RefreshCw, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "mthly",
    label: "Monthly",
    bar: "bg-blue-400 dark:bg-blue-500",
    dot: "bg-blue-400 dark:bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "qtrly",
    label: "Quarterly",
    bar: "bg-violet-400 dark:bg-violet-500",
    dot: "bg-violet-400 dark:bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "yrly",
    label: "Yearly",
    bar: "bg-emerald-400 dark:bg-emerald-500",
    dot: "bg-emerald-400 dark:bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "lifetime",
    label: "Lifetime",
    bar: "bg-amber-400 dark:bg-amber-500",
    dot: "bg-amber-400 dark:bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
];

export default function SubscriptionBreakdown({ subscriptions, className }) {
  const active = subscriptions?.active ?? {};
  const total = PLANS.reduce((sum, p) => sum + (active[p.key] ?? 0), 0);
  const cancellationScheduled = subscriptions?.cancellationScheduled ?? 0;
  const churnedTotal = subscriptions?.churnedTotal ?? 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E5D7C4] bg-white p-5 dark:border-white/10 dark:bg-[#2A2520]",
        className
      )}
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <div
          className="flex size-7 items-center justify-center rounded-lg bg-[#F0EDE7] dark:bg-[#231F1A]"
          aria-hidden="true"
        >
          <RefreshCw size={14} className="text-[#7A736C] dark:text-[#B5AFA5]" />
        </div>
        <h3 className="font-manrope text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          Subscriptions
        </h3>
        {total > 0 && (
          <div className="ml-auto flex items-baseline gap-1.5">
            <span className="font-dm-mono text-2xl font-medium text-[#1A1A1A] tabular-nums dark:text-[#F0EDE7]">
              {total}
            </span>
            <span className="font-manrope text-xs text-[#7A736C] dark:text-[#B5AFA5]">active</span>
          </div>
        )}
      </div>

      {/* Plan rows */}
      <div className="mb-5 flex flex-col gap-4">
        {PLANS.map((p) => {
          const count = active[p.key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={p.key} className={cn("flex flex-col gap-1.5", count === 0 && "opacity-35")}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cn("size-2 shrink-0 rounded-full", p.dot)} aria-hidden="true" />
                  <span className="font-manrope text-xs font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                    {p.label}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="w-7 text-right font-mono text-[10px] text-[#B5AFA5] tabular-nums dark:text-[#5A544E]">
                    {pct}%
                  </span>
                  <span
                    className={cn(
                      "font-dm-mono w-5 text-right text-sm font-semibold tabular-nums",
                      p.text
                    )}
                  >
                    {count}
                  </span>
                </div>
              </div>
              <div
                className="h-1 overflow-hidden rounded-full bg-[#F0EDE7] dark:bg-[#231F1A]"
                aria-hidden="true"
              >
                <div
                  className={cn("h-full rounded-full transition-all duration-700", p.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E5D7C4] pt-4 dark:border-white/[0.07]">
        <div className="flex items-center gap-1.5">
          <AlertTriangle
            size={12}
            className={cn(
              cancellationScheduled > 0
                ? "text-amber-500 dark:text-amber-400"
                : "text-[#C5BFB9] dark:text-[#5A544E]"
            )}
            aria-hidden="true"
          />
          <span className="font-manrope text-xs text-[#7A736C] dark:text-[#B5AFA5]">
            Pending cancellation:{" "}
            <strong
              className={cn(
                "font-dm-mono font-semibold tabular-nums",
                cancellationScheduled > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-[#1A1A1A] dark:text-[#F0EDE7]"
              )}
            >
              {cancellationScheduled}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle size={12} className="text-[#C5BFB9] dark:text-[#5A544E]" aria-hidden="true" />
          <span className="font-manrope text-xs text-[#7A736C] dark:text-[#B5AFA5]">
            Churned all-time:{" "}
            <strong className="font-dm-mono font-medium text-[#1A1A1A] tabular-nums dark:text-[#F0EDE7]">
              {churnedTotal}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
