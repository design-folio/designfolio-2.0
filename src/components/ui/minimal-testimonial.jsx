"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote:
      "The customisations are awesome and incredibly helpful in bringing out the true flavour of my design projects! 🙌🏼 Totally worth spending time on — such a GOATed portfolio builder!",
    name: "Ashutosh Vashishtha",
    role: "Design Evangelist at Apple",
    image: "/assets/png/ashuthosh.png",
  },
  {
    quote:
      "I was procrastinating on building my portfolio for a year, but Designfolio completely changed that — it helped me go from Word/Figma case studies to a live website in just 20 minutes.",
    name: "Ishita Chaudhary",
    role: "Product & Business @ Cisco",
    image: "/assets/png/ishita.png",
  },
  {
    quote:
      "Designfolio is the ideal launchpad for designers and product managers to showcase their skills with an extremely efficient portfolio builder that covers every section recruiters care about.",
    name: "Suvigya Nijhawan",
    role: "Product @ Google",
    image: "/assets/png/suvigya.png",
  },
  {
    quote:
      "Designfolio has been a fantastic way to showcase my work in a clean, customizable format that reflects my personal style while keeping everything polished and professional",
    name: "Aditya Krishna",
    role: "Design Manager @ Multiplier",
    image: "/assets/png/aditya.png",
  },
];

const AUTO_PLAY_DURATION = 8000; // 8 seconds

export function TestimonialsMinimal() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / AUTO_PLAY_DURATION) * 100;

      if (newProgress >= 100) {
        setActive((prev) => (prev + 1) % testimonials.length);
        setProgress(0);
      } else {
        setProgress(newProgress);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-6 text-center">
      {/* Quote */}
      <div className="relative mb-6 flex min-h-[100px] items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -5, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-foreground-landing text-lg leading-relaxed font-light md:text-xl"
          >
            &quot;{testimonials[active].quote}&quot;
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Author Row */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
              setProgress(0);
            }}
            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Avatars */}
          <div className="flex -space-x-2">
            {testimonials.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i);
                  setProgress(0);
                }}
                className={`ring-background-landing relative h-8 w-8 overflow-hidden rounded-full ring-2 transition-all duration-500 ease-in-out ${
                  active === i
                    ? "z-10 scale-125 shadow-md"
                    : "opacity-70 grayscale hover:scale-110 hover:opacity-100 hover:grayscale-0"
                } `}
              >
                <img
                  src={t.image || "/placeholder.svg"}
                  alt={t.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setActive((prev) => (prev + 1) % testimonials.length);
              setProgress(0);
            }}
            className="hover:bg-muted text-muted-foreground hover:text-foreground-landing rounded-full p-1 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Active Author Info */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center"
            >
              <span className="text-foreground-landing text-sm font-medium">
                {testimonials[active].name}
              </span>
              <span className="text-muted-foreground text-xs">{testimonials[active].role}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="bg-muted h-0.5 w-32 overflow-hidden rounded-full">
          <motion.div
            className="bg-foreground-landing/10 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
