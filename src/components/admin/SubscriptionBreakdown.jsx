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
        "bg-white dark:bg-[#2A2520] rounded-2xl border border-[#E5D7C4] dark:border-white/10 p-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="size-7 rounded-lg bg-[#F0EDE7] dark:bg-[#231F1A] flex items-center justify-center"
          aria-hidden="true"
        >
          <RefreshCw size={14} className="text-[#7A736C] dark:text-[#B5AFA5]" />
        </div>
        <h3 className="text-sm font-manrope font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          Subscriptions
        </h3>
        {total > 0 && (
          <div className="ml-auto flex items-baseline gap-1.5">
            <span className="text-2xl font-dm-mono font-medium tabular-nums text-[#1A1A1A] dark:text-[#F0EDE7]">
              {total}
            </span>
            <span className="text-xs font-manrope text-[#7A736C] dark:text-[#B5AFA5]">active</span>
          </div>
        )}
      </div>

      {/* Plan rows */}
      <div className="flex flex-col gap-4 mb-5">
        {PLANS.map((p) => {
          const count = active[p.key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={p.key} className={cn("flex flex-col gap-1.5", count === 0 && "opacity-35")}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("size-2 rounded-full shrink-0", p.dot)} aria-hidden="true" />
                  <span className="text-xs font-manrope font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                    {p.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono tabular-nums text-[#B5AFA5] dark:text-[#5A544E] w-7 text-right">
                    {pct}%
                  </span>
                  <span
                    className={cn(
                      "text-sm font-dm-mono font-semibold tabular-nums w-5 text-right",
                      p.text
                    )}
                  >
                    {count}
                  </span>
                </div>
              </div>
              <div
                className="h-1 rounded-full bg-[#F0EDE7] dark:bg-[#231F1A] overflow-hidden"
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
      <div className="pt-4 border-t border-[#E5D7C4] dark:border-white/[0.07] flex flex-wrap items-center gap-x-5 gap-y-2">
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
          <span className="text-xs font-manrope text-[#7A736C] dark:text-[#B5AFA5]">
            Pending cancellation:{" "}
            <strong
              className={cn(
                "font-dm-mono tabular-nums font-semibold",
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
          <span className="text-xs font-manrope text-[#7A736C] dark:text-[#B5AFA5]">
            Churned all-time:{" "}
            <strong className="font-dm-mono tabular-nums font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              {churnedTotal}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
