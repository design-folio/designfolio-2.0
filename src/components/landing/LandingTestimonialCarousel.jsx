import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { testimonials } from "./shared/testimonialData";

export default function LandingTestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const navigate = (dir) => {
    setCurrentIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);
    setProgress(0);
  };

  useEffect(() => {
    const duration = 5000;
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

  return (
    <section
      id="stories"
      className="w-full border-y border-[--lp-border] py-8 px-6 bg-[--lp-card] overflow-hidden scroll-mt-[30vh]"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="w-full max-w-[500px] mx-auto flex flex-col items-center">
        <div className="w-full relative h-[130px] sm:h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col w-full absolute top-0 left-0"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[28%] overflow-hidden shrink-0 border border-[--lp-border] shadow-sm">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="text-[--lp-text] text-[14px] font-bold leading-tight">
                      {t.name}
                    </div>
                    <div className="text-[12px] font-medium text-[--lp-text-muted] leading-tight">
                      {t.role}
                    </div>
                  </div>
                </div>
                {t.logoSrc && (
                  <img
                    src={t.logoSrc}
                    alt=""
                    aria-hidden="true"
                    className={cn("shrink-0", !t.logoRaw && "opacity-20 dark:invert")}
                    style={{ width: 36, height: 36, objectFit: "contain" }}
                  />
                )}
              </div>

              <p className="text-[--lp-text]/80 font-medium text-[15px] leading-[1.5]">
                {t.content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 mt-6 w-full">
          <button
            onClick={() => navigate(-1)}
            aria-label="Previous testimonial"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[--lp-text]/30 border border-[--lp-text]/10 transition-colors hover:text-[--lp-text]/60 hover:border-[--lp-text]/20"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          <div className="flex-1 h-[3px] bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black/20 dark:bg-white/20 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.05 }}
            />
          </div>

          <button
            onClick={() => navigate(1)}
            aria-label="Next testimonial"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[--lp-text]/30 border border-[--lp-text]/10 transition-colors hover:text-[--lp-text]/60 hover:border-[--lp-text]/20"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
