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
      className="w-full scroll-mt-[30vh] overflow-hidden border-y border-(--lp-border) bg-(--lp-card) px-6 py-8"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="mx-auto flex w-full max-w-[560px] flex-col items-center">
        <div className="relative h-[155px] w-full sm:h-[145px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute top-0 left-0 flex w-full flex-col"
            >
              <div className="mb-3.5 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-(--lp-video-border) shadow-sm">
                    <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div className="mb-0.5 text-[15px] leading-tight font-bold text-(--lp-text)">
                      {t.name}
                    </div>
                    <div className="text-[13px] leading-tight font-medium text-(--lp-text-muted)">
                      {t.role}
                    </div>
                  </div>
                </div>
                {t.logoSrc && (
                  <div
                    className={cn(
                      "h-11 w-11 shrink-0 overflow-hidden rounded-full border border-(--lp-video-border)",
                      !t.logoRaw && "bg-white dark:bg-white/5"
                    )}
                  >
                    <img
                      src={t.logoSrc}
                      alt=""
                      aria-hidden="true"
                      className={cn(
                        "h-full w-full object-cover",
                        !t.logoRaw && "opacity-50 dark:invert"
                      )}
                    />
                  </div>
                )}
              </div>

              <p className="text-lp-text/75 text-[15px] leading-[1.55] font-medium">
                {renderHighlights(t, isDark)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex w-full items-center gap-3">
          <motion.button
            onClick={() => navigate(-1)}
            aria-label="Previous testimonial"
            whileTap={{ y: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className="text-lp-text/40 hover:text-lp-text/70 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150"
            style={btnStyle}
          >
            <ChevronLeft className="size-3.5" />
          </motion.button>

          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
            <motion.div
              className="h-full rounded-full bg-black/20 dark:bg-white/20"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.05 }}
            />
          </div>

          <motion.button
            onClick={() => navigate(1)}
            aria-label="Next testimonial"
            whileTap={{ y: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className="text-lp-text/40 hover:text-lp-text/70 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150"
            style={btnStyle}
          >
            <ChevronRight className="size-3.5" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
