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
      <span className="text-xs font-manrope text-[#7A736C] dark:text-[#B5AFA5] font-medium tracking-wide uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {fmtINR && (
          <span
            className={`text-sm font-dm-mono tabular-nums font-medium ${
              highlight
                ? "text-[#1A1A1A] dark:text-[#F0EDE7]"
                : "text-[#7A736C] dark:text-[#B5AFA5]"
            }`}
          >
            {fmtINR}
          </span>
        )}
        {fmtINR && fmtUSD && (
          <span className="text-[#E5D7C4] dark:text-white/20 text-xs select-none">·</span>
        )}
        {fmtUSD && (
          <span
            className={`text-sm font-dm-mono tabular-nums font-medium ${
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
    <div className="bg-white dark:bg-[#2A2520] rounded-2xl border border-[#E5D7C4] dark:border-white/10 p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-7 h-7 rounded-lg bg-[#F0EDE7] dark:bg-[#231F1A] flex items-center justify-center"
          aria-hidden="true"
        >
          <TrendingUp size={14} className="text-[#7A736C] dark:text-[#B5AFA5]" />
        </div>
        <h3 className="text-sm font-manrope font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
          Revenue
        </h3>
        <span className="ml-auto text-[10px] font-medium text-[#B5AFA5] dark:text-[#7A736C] uppercase tracking-wider">
          INR · USD
        </span>
      </div>

      <div className="divide-y divide-[#E5D7C4] dark:divide-white/[0.07] flex-1">
        <Row label="All-time" inr={revenue?.INR} usd={revenue?.USD} highlight />
        <Row label="MRR" inr={mrr?.INR} usd={mrr?.USD} highlight={false} />
        <Row label="ARR" inr={arr?.INR} usd={arr?.USD} highlight={false} />
      </div>

      {hasMrr && (
        <p className="text-[10px] text-[#B5AFA5] dark:text-[#5A544E] mt-3 leading-relaxed">
          MRR = active recurring subs, month-normalised. ARR = MRR × 12.
        </p>
      )}
    </div>
  );
}
