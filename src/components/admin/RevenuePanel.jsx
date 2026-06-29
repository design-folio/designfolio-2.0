import { TrendingUp } from "lucide-react";

function fmt(currency, amount) {
  if (!amount) return null;
  return currency === "INR"
    ? `₹${Number(amount).toLocaleString("en-IN")}`
    : `$${Number(amount).toLocaleString("en-US")}`;
}

function Row({ label, inr, usd, highlight }) {
  const fmtINR = fmt("INR", inr);
  const fmtUSD = fmt("USD", usd);
  if (!fmtINR && !fmtUSD) return null;

  return (
    <div className="flex items-center justify-between py-3">
      <span className="font-manrope text-xs font-medium tracking-wide text-[#7A736C] uppercase dark:text-[#B5AFA5]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {fmtINR && (
          <span
            className={`font-dm-mono text-sm font-medium tabular-nums ${
              highlight
                ? "text-[#1A1A1A] dark:text-[#F0EDE7]"
                : "text-[#7A736C] dark:text-[#B5AFA5]"
            }`}
          >
            {fmtINR}
          </span>
        )}
        {fmtINR && fmtUSD && (
          <span className="text-xs text-[#E5D7C4] select-none dark:text-white/20">·</span>
        )}
        {fmtUSD && (
          <span
            className={`font-dm-mono text-sm font-medium tabular-nums ${
              highlight
                ? "text-[#1A1A1A] dark:text-[#F0EDE7]"
                : "text-[#7A736C] dark:text-[#B5AFA5]"
            }`}
          >
            {fmtUSD}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RevenuePanel({ overall }) {
  const { revenue, mrr, arr } = overall ?? {};
  const hasMrr = mrr?.INR || mrr?.USD;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#E5D7C4] bg-white p-5 dark:border-white/10 dark:bg-[#2A2520]">
      <div className="mb-1 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0EDE7] dark:bg-[#231F1A]"
          aria-hidden="true"
        >
          <TrendingUp size={14} className="text-[#7A736C] dark:text-[#B5AFA5]" />
        </div>
        <h3 className="font-manrope text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          Revenue
        </h3>
        <span className="ml-auto text-[10px] font-medium tracking-wider text-[#B5AFA5] uppercase dark:text-[#7A736C]">
          INR · USD
        </span>
      </div>

      <div className="flex-1 divide-y divide-[#E5D7C4] dark:divide-white/[0.07]">
        <Row label="All-time" inr={revenue?.INR} usd={revenue?.USD} highlight />
        <Row label="MRR" inr={mrr?.INR} usd={mrr?.USD} highlight={false} />
        <Row label="ARR" inr={arr?.INR} usd={arr?.USD} highlight={false} />
      </div>

      {hasMrr && (
        <p className="mt-3 text-[10px] leading-relaxed text-[#B5AFA5] dark:text-[#5A544E]">
          MRR = active recurring subs, month-normalised. ARR = MRR × 12.
        </p>
      )}
    </div>
  );
}
