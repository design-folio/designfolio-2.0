import { motion, AnimatePresence } from "framer-motion";
import { FileText, TrendingUp, BookOpen, Mic, Mail, BarChart2, ChevronRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ShimmerInView from "./shared/ShimmerInView";
import Link from "next/link";

const STEPS = [
  {
    step: "1/",
    title: 'Choose a "template".',
    video: "/landing-video/template-section.mp4",
  },
  {
    step: "2/",
    title: 'Use AI as a "co-pilot".',
    video: "/landing-video/analyzeai.mp4",
  },
  {
    step: "3/",
    title: 'And other "AI tools".',
    video: "/landing-video/other-ai-tools.mp4",
    features: [
      { label: "Fix your resume", icon: FileText, color: "#2563EB", lightBg: "#DBEAFE", midBg: "#BFDBFE", href: "/ai-tools?type=optimize-resume" },
      { label: "Salary Negotiation", icon: TrendingUp, color: "#16A34A", lightBg: "#DCFCE7", midBg: "#BBF7D0", href: "/ai-tools?type=salary-negotiator" },
      { label: "Case study generator", icon: BookOpen, color: "#7C3AED", lightBg: "#EDE9FE", midBg: "#DDD6FE", href: "/login" },
      { label: "AI mock interview", icon: Mic, color: "#C2410C", lightBg: "#FFEDD5", midBg: "#FED7AA", href: "/ai-tools?type=mock-interview" },
      { label: "AI email generator", icon: Mail, color: "#0D9488", lightBg: "#CCFBF1", midBg: "#99F6E4", href: "/ai-tools?type=email-generator" },
      { label: "Analyze Case study", icon: BarChart2, color: "#DC2626", lightBg: "#FFE4E1", midBg: "#FECACA", href: "/login" },
    ],
  },
];

function FeatureRow({ f, isLast }) {
  const Icon = f.icon;
  const pillStyle = f.lightBg && f.midBg
    ? {
      background: `radial-gradient(circle at 38% 32%, ${f.lightBg}, ${f.midBg})`,
      boxShadow: `inset 0 1.5px 2px rgba(255,255,255,0.75), inset 0 -1px 2px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)`,
    }
    : undefined;

  return (
    <Link
      href={f.href || "/ai-tools"}
      className={cn(
        "group flex items-center justify-between px-4 py-3.5 bg-[--lp-bg] hover:bg-[#F8F7EE] dark:hover:bg-white/[0.03] transition-colors duration-150 no-underline [&_*]:cursor-pointer cursor-pointer",
        !isLast && "border-b border-[--lp-video-border]",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-black/[0.08] dark:bg-white/[0.10]">
          <span
            className="absolute inset-0 rounded-full scale-100 sm:scale-0 sm:group-hover:scale-100 transition-transform duration-300 ease-out origin-center"
            style={pillStyle}
          />
          <Icon
            className="absolute h-3.5 w-3.5 text-[--lp-text]/30 opacity-0 sm:opacity-100 transition-opacity duration-200 sm:group-hover:opacity-0"
            strokeWidth={1.75}
          />
          <Icon
            className="absolute h-3.5 w-3.5 opacity-100 sm:opacity-0 transition-opacity duration-200 sm:group-hover:opacity-100"
            style={f.color ? { color: f.color } : undefined}
            strokeWidth={1.75}
          />
        </div>
        <span className="text-[14px] font-medium text-[--lp-text]">{f.label}</span>
      </div>
      <ArrowUpRight
        className="h-[15px] w-[15px] text-[--lp-text]/40 opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0 flex-shrink-0"
        strokeWidth={2}
      />
    </Link>
  );
}

export default function LandingHowSection({ showAllFeatures, onToggleFeatures }) {
  return (
    <section
      id="how"
      className="w-full px-6 mb-16 mt-[48px] scroll-mt-24"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="w-full flex flex-col gap-12">
        {STEPS.map((item, i) => (
          <div key={i} className="flex flex-col gap-5">
            <h3 className="text-[18px] font-bold text-[--lp-text]">
              {item.step} <ShimmerInView text={item.title} />
            </h3>

            <div className="w-full rounded-[12px] overflow-hidden border border-[--lp-video-border] shadow-sm bg-[#141414]">
              <div className="relative w-full overflow-hidden" style={{ paddingTop: "65%" }}>
                <video
                  src={item.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover origin-center"
                />
              </div>
            </div>

            {item.features && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col rounded-xl border border-[--lp-video-border] overflow-hidden">
                  {item.features.slice(0, 3).map((f, fi) => (
                    <FeatureRow
                      key={fi}
                      f={f}
                      isLast={!showAllFeatures && fi === 2}
                    />
                  ))}
                  <motion.div
                    initial={false}
                    animate={{ height: showAllFeatures ? "auto" : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 38,
                      restDelta: 0.5,
                    }}
                    style={{ overflow: "hidden" }}
                  >
                    {item.features.slice(3).map((f, fi) => (
                      <motion.div
                        key={`hidden-${fi}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={
                          showAllFeatures
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: -6 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                          delay: showAllFeatures ? fi * 0.06 : 0,
                        }}
                      >
                        <FeatureRow f={f} isLast={fi === item.features.slice(3).length - 1} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <button
                  onClick={onToggleFeatures}
                  className="self-start flex items-center gap-1.5 px-1 py-1 text-[13px] font-medium text-[--lp-text]/50 hover:text-[--lp-text] transition-colors duration-150"
                >
                  <span className="cursor-pointer">
                    {showAllFeatures
                      ? "Show less"
                      : `+${item.features.length - 3} more tools`}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-300",
                      showAllFeatures && "rotate-90",
                    )}
                  />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
