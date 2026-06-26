const QUOTES = [
  "Finally finished my portfolio.",
  "Just works.",
  "Got shortlisted the same week.",
  "Clean design.",
  "So clean. So fast.",
];

const allQuotes = [...QUOTES, ...QUOTES, ...QUOTES];

export default function LandingQuoteBanner() {
  return (
    <div className="w-full overflow-hidden bg-[#1D1B1A] dark:bg-[#111] py-3.5">
      <div
        className="flex items-center gap-10 w-max"
        style={{ animation: "quoteScroll 60s linear infinite" }}
      >
        {allQuotes.map((quote, i) => (
          <span key={i} className="flex items-center gap-2.5 shrink-0">
            <span className="text-white text-[13px] font-bold whitespace-nowrap">
              &ldquo;{quote}&rdquo;
            </span>
            <span className="text-[13px] tracking-tight" style={{ color: "#FFD700" }}>
              ★★★★★
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
