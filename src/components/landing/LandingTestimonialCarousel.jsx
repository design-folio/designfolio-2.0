import { useState, useEffect, startTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { testimonials } from "./shared/testimonialData";
import { useTheme } from "next-themes";

function renderHighlights(t, isDark) {
  const phrases = t.highlights ?? [];
  const bg = isDark ? t.highlightDarkBg : t.highlightBg;
  if (!phrases.length || !bg) return t.content;

  const parts = [t.content];
  for (const phrase of phrases) {
    const next = [];
    for (const part of parts) {
      if (typeof part !== "string") {
        next.push(part);
        continue;
      }
      const idx = part.indexOf(phrase);
      if (idx === -1) {
        next.push(part);
        continue;
      }
      if (idx > 0) next.push(part.slice(0, idx));
      next.push(
        <mark
          key={phrase}
          style={{ background: bg, borderRadius: "3px", padding: "1px 3px", color: "inherit" }}
        >
          {phrase}
        </mark>
      );
      if (idx + phrase.length < part.length) next.push(part.slice(idx + phrase.length));
    }
    parts.splice(0, parts.length, ...next);
  }
  return parts;
}

export default function LandingTestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  const navigate = (dir) => {
    setCurrentIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);
    setProgress(0);
  };

  useEffect(() => {
    const duration = 10000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((current) => (current + 1) % testimonials.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const t = testimonials[currentIndex];

  const btnStyle = isDark
    ? {
        background: "linear-gradient(to bottom, #2e2c2a, #252320)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.07)",
      }
    : {
        background: "linear-gradient(to bottom, #ffffff, #ece9e3)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
        border: "1px solid rgba(0,0,0,0.07)",
      };

  return (
    <section
      id="stories"
      className="w-full border-y border-(--lp-border) py-8 px-6 bg-(--lp-card) overflow-hidden scroll-mt-[30vh]"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="w-full max-w-[560px] mx-auto flex flex-col items-center">
        <div className="w-full relative h-[155px] sm:h-[145px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col w-full absolute top-0 left-0"
            >
              <div className="flex items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-(--lp-video-border) shadow-sm">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="text-(--lp-text) text-[15px] font-bold leading-tight mb-0.5">
                      {t.name}
                    </div>
                    <div className="text-[13px] font-medium text-(--lp-text-muted) leading-tight">
                      {t.role}
                    </div>
                  </div>
                </div>
                {t.logoSrc && (
                  <div
                    className={cn(
                      "shrink-0 w-11 h-11 rounded-full overflow-hidden border border-(--lp-video-border)",
                      !t.logoRaw && "bg-white dark:bg-white/5"
                    )}
                  >
                    <img
                      src={t.logoSrc}
                      alt=""
                      aria-hidden="true"
                      className={cn(
                        "w-full h-full object-cover",
                        !t.logoRaw && "opacity-50 dark:invert"
                      )}
                    />
                  </div>
                )}
              </div>

              <p className="text-lp-text/75 font-medium text-[15px] leading-[1.55]">
                {renderHighlights(t, isDark)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 mt-6 w-full">
          <motion.button
            onClick={() => navigate(-1)}
            aria-label="Previous testimonial"
            whileTap={{ y: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lp-text/40 transition-colors duration-150 hover:text-lp-text/70"
            style={btnStyle}
          >
            <ChevronLeft className="size-3.5" />
          </motion.button>

          <div className="flex-1 h-[3px] bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black/20 dark:bg-white/20 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.05 }}
            />
          </div>

          <motion.button
            onClick={() => navigate(1)}
            aria-label="Next testimonial"
            whileTap={{ y: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lp-text/40 transition-colors duration-150 hover:text-lp-text/70"
            style={btnStyle}
          >
            <ChevronRight className="size-3.5" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
