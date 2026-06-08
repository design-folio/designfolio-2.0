import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { testimonials, scrollerExtraTestimonials } from "./shared/testimonialData";

function MasonryScrollCard({ t }) {
  return (
    <div className="px-4 py-4 rounded-xl border border-[--lp-video-border] bg-[--lp-bg]">
      <p className="text-[14px] leading-[1.65] text-lp-text/75 font-medium mb-4">
        "{t.content}"
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={t.image}
            alt={t.name}
            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13px] font-semibold text-lp-text leading-none truncate">
              {t.name}
            </span>
            <span className="text-[11.5px] text-lp-text/45 leading-tight truncate">
              {t.role}
            </span>
          </div>
        </div>
        {t.logoSrc && (
          <div
            className={cn(
              "shrink-0 w-7 h-7 rounded-full overflow-hidden",
              !t.logoRaw && "bg-white dark:bg-white/5"
            )}
          >
            <img
              src={t.logoSrc}
              alt=""
              aria-hidden="true"
              className={cn(
                "w-full h-full object-cover",
                !t.logoRaw && "opacity-40 dark:invert"
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Purely presentational — all animation is driven by the parent's single RAF loop
function MasonryScrollColumn({ items, innerRef, className }) {
  const doubled = [...items, ...items];
  return (
    <div className={cn("flex-1 min-w-0 overflow-hidden", className)}>
      <div ref={innerRef} className="flex flex-col gap-3 w-full">
        {doubled.map((t, i) => (
          <MasonryScrollCard key={i} t={t} />
        ))}
      </div>
    </div>
  );
}

export default function LandingVerticalScroller() {
  const all = [...scrollerExtraTestimonials, ...testimonials];
  const col1Items = all.filter((_, i) => i % 2 === 0);
  const col2Base = all.filter((_, i) => i % 2 === 1);
  const col2Items = col2Base.length < col1Items.length ? [...col2Base, all[0]] : col2Base;

  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const hoveredRef = useRef(false);

  // Single shared accumulator — both columns advance from the same number.
  // This makes equal speed a mathematical certainty, not an approximation.
  const pixelsRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const [pps, setPps] = useState(55);

  useEffect(() => {
    const update = () => setPps(window.innerWidth < 640 ? 35 : 55);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const run = (timestamp) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      // Cap delta so a backgrounded tab doesn't cause a position jump on return
      const delta = Math.min(timestamp - lastTimeRef.current, 50);
      lastTimeRef.current = timestamp;

      const effectivePps = hoveredRef.current ? pps * 0.35 : pps;
      pixelsRef.current += effectivePps * delta / 1000;

      // col1 scrolls up: translateY goes from 0 toward -h1, then wraps
      const col1 = col1Ref.current;
      if (col1) {
        const h1 = col1.scrollHeight / 2;
        if (h1 > 0) {
          col1.style.transform = `translateY(${-(pixelsRef.current % h1)}px)`;
        }
      }

      // col2 scrolls down: translateY goes from -h2 toward 0, then wraps
      const col2 = col2Ref.current;
      if (col2) {
        const h2 = col2.scrollHeight / 2;
        if (h2 > 0) {
          col2.style.transform = `translateY(${(pixelsRef.current % h2) - h2}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(run);
    };

    rafRef.current = requestAnimationFrame(run);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [pps]);

  return (
    <section
      className="w-full overflow-hidden border-y border-[--lp-border] bg-[--lp-card]"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div
        className="flex gap-3 px-6 overflow-hidden"
        style={{ height: 440 }}
        onMouseEnter={() => { hoveredRef.current = true; }}
        onMouseLeave={() => { hoveredRef.current = false; }}
      >
        <MasonryScrollColumn items={col1Items} innerRef={col1Ref} />
        <MasonryScrollColumn
          items={col2Items}
          innerRef={col2Ref}
          className="hidden min-[720px]:flex"
        />
      </div>
    </section>
  );
}
