import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    label: "Build your portfolio",
    darkSrc: "/landing-video/hero-dark.mp4",
    lightSrc: "/landing-video/hero-light.mp4",
  },
  {
    label: "Find your next role",
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
      className="w-full px-6 mb-16"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        className="flex flex-col gap-5"
      >
        {/* Tab header */}
        <div className="flex items-end gap-8 px-1">
          {STEPS.map((step, i) => {
            const isActive = heroStep === i;
            return (
              <button
                key={i}
                onClick={() => { setHeroStep(i); setHeroProgress(0); }}
                className="relative flex flex-col items-start gap-2 cursor-pointer group"
              >
                <span
                  className={cn(
                    "text-[13px] font-semibold leading-none transition-colors duration-200 whitespace-nowrap",
                    isActive
                      ? "text-[--lp-text]"
                      : "text-lp-text/35 group-hover:text-lp-text/55",
                  )}
                >
                  {step.label}
                </span>
                <div className="w-full h-[2px] rounded-full bg-lp-text/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[--lp-accent] transition-none"
                    style={{ width: isActive ? `${heroProgress}%` : "0%" }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Video */}
        <div className="rounded-[20px] overflow-hidden border border-[--lp-video-border] bg-[#141414]">
          <div className="relative w-full" style={{ paddingTop: "65%" }}>
            <video
              key={heroStep}
              src={isDark ? STEPS[heroStep].darkSrc : STEPS[heroStep].lightSrc}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover origin-center"
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
