import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { LayoutTemplate, Sparkles } from "lucide-react";
import { forwardRef, useState } from "react";

const STEPS = [
  {
    label: "Portfolio Builder",
    icon: LayoutTemplate,
    darkSrc: "/landing-video/hero-dark.mp4",
    lightSrc: "/landing-video/hero-light.mp4",
  },
  {
    label: "AI Job Matching",
    icon: Sparkles,
    darkSrc: "/landing-video/hero-jobs-dark.mp4",
    lightSrc: "/landing-video/hero-jobs-light.mp4",
  },
];

const LandingVideoSection = forwardRef(function LandingVideoSection({ isDark }, ref) {
  const [heroStep, setHeroStep] = useState(0);
  const [heroProgress, setHeroProgress] = useState(0);

  return (
    <section
      ref={ref}
      className="mb-16 w-full px-6"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        className="flex flex-col gap-5"
      >
        {/* Tab header */}
        <div className="flex items-end justify-center gap-8 px-1">
          {STEPS.map((step, i) => {
            const isActive = heroStep === i;
            return (
              <button
                key={i}
                onClick={() => {
                  setHeroStep(i);
                  setHeroProgress(0);
                }}
                className="group relative flex cursor-pointer flex-col items-start gap-2"
              >
                <span
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 text-[13px] leading-none font-semibold whitespace-nowrap transition-colors duration-200",
                    isActive ? "text-(--lp-text)" : "text-lp-text/35 group-hover:text-lp-text/55"
                  )}
                >
                  <step.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  {step.label}
                </span>
                <div className="bg-lp-text/10 h-[2px] w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-(--lp-accent) transition-none"
                    style={{ width: isActive ? `${heroProgress}%` : "0%" }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Video */}
        <div className="overflow-hidden rounded-[16px] border border-(--lp-video-border) bg-[#141414]">
          <div className="relative w-full" style={{ paddingTop: "78.75%" }}>
            <video
              key={heroStep}
              src={isDark ? STEPS[heroStep].darkSrc : STEPS[heroStep].lightSrc}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 h-full w-full origin-center object-cover"
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration) setHeroProgress((v.currentTime / v.duration) * 100);
              }}
              onEnded={() => {
                setHeroStep((s) => (s + 1) % STEPS.length);
                setHeroProgress(0);
              }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
});

export default LandingVideoSection;
