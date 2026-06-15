import { LayoutTemplate, EyeOff, XCircle, FileText, PenLine, Mic } from "lucide-react";

const PAIN_POINTS = [
  { icon: LayoutTemplate, color: "#9B7FD4", label: "I don't have a portfolio." },
  { icon: EyeOff,         color: "#5B9BD5", label: "I'm tired of applying blindly." },
  { icon: XCircle,        color: "#E8923A", label: "Why am I getting rejected?" },
  { icon: FileText,       color: "#E05C6A", label: "Maybe my resume is the problem." },
  { icon: PenLine,        color: "#7BAE7F", label: "I hate writing case studies." },
  { icon: Mic,            color: "#E8923A", label: "I freeze during interviews." },
];

export default function LandingPainPoints() {
  return (
    <section
      className="w-full px-6 pt-12 pb-4 flex flex-col items-center gap-6"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <h2 className="text-[28px] font-bold text-[--lp-text] tracking-tight leading-tight text-center">
        {"You're not the only one thinking..."}
      </h2>
      <div className="flex flex-wrap justify-center gap-2.5">
        {PAIN_POINTS.map(({ icon: Icon, color, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[--lp-border] bg-[--lp-bg] text-[13px] font-medium text-[--lp-text] whitespace-nowrap"
          >
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
