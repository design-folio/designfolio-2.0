import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { testimonials, scrollerExtraTestimonials } from "./shared/testimonialData";

function VerticalTestimonialsScroller({ duration }) {
  const all = [...testimonials, ...scrollerExtraTestimonials];
  const doubled = [...all, ...all];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: 420,
        maskImage:
          "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
      }}
    >
      <motion.ul
        key={duration}
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-3 list-none m-0 p-0"
      >
        {doubled.map((t, i) => (
          <li
            key={i}
            className="px-5 py-5 rounded-xl border border-[--lp-video-border] bg-[--lp-bg]"
          >
            <p className="text-[14px] leading-[1.6] text-[--lp-text]/80 font-medium mb-4">
              "{t.content}"
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-8 w-8 rounded-[28%] object-cover flex-shrink-0"
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] font-semibold text-[--lp-text] leading-none">
                    {t.name}
                  </span>
                  <span className="text-[12px] text-[--lp-text-muted]">{t.role}</span>
                </div>
              </div>
              {t.logoSrc && (
                <img
                  src={t.logoSrc}
                  alt=""
                  aria-hidden="true"
                  className={cn(
                    "shrink-0",
                    !t.logoRaw && "opacity-20 dark:invert",
                  )}
                  style={{ width: 32, height: 32, objectFit: "contain" }}
                />
              )}
            </div>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

const SPEED_LABELS = ["Taking it easy", "Comfortable", "Normal", "Skimming", "Quick scan"];
const SPEED_DURATIONS = [52, 38, 28, 18, 11];

export default function LandingVerticalScroller({ speedLevel, onSpeedChange, isDark, playSliderTick }) {
  const scrollDuration = SPEED_DURATIONS[speedLevel - 1];

  return (
    <section
      className="w-full border-y border-[--lp-border] px-6 pt-10 pb-4 bg-[--lp-card]"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[12px] font-semibold tracking-widest uppercase text-[--lp-text]/40 tabular-nums w-[130px]">
          {SPEED_LABELS[speedLevel - 1]}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-[--lp-text]/30 font-medium">Slow</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={speedLevel}
            onChange={(e) => {
              const v = Number(e.target.value);
              onSpeedChange(v);
              playSliderTick(v);
            }}
            className="speed-slider w-24 h-1 appearance-none cursor-pointer rounded-full outline-none"
            style={{
              color: isDark ? "#F0EDE7" : "#1D1B1A",
              background: isDark
                ? `linear-gradient(to right, #F0EDE7 ${(speedLevel - 1) * 25}%, #F0EDE740 ${(speedLevel - 1) * 25}%)`
                : `linear-gradient(to right, #1D1B1A ${(speedLevel - 1) * 25}%, #1D1B1A30 ${(speedLevel - 1) * 25}%)`,
            }}
          />
          <span className="text-[11px] text-[--lp-text]/30 font-medium">Fast</span>
        </div>
      </div>

      <VerticalTestimonialsScroller duration={scrollDuration} />
    </section>
  );
}
