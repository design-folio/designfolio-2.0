import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Lottie from "lottie-react";
import aiAssistantAnimation from "@/assets/AI-Assistant.json";

// jobCount   — real number of matched jobs from POST /jobs/recommend response
// answers    — [{ question, answer }] array; used to populate "Filtered for you" summary

export function AhaMomentModal({ jobCount = 0, answers = [], onConfirm }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!jobCount) return;
    let frame;
    const start = performance.now();
    const duration = 1200;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(ease(progress) * jobCount));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    const delay = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 420);
    return () => {
      clearTimeout(delay);
      cancelAnimationFrame(frame);
    };
  }, [jobCount]);

  // Build summary rows from quiz answers
  // answers[0] = work type, answers[1] = location, answers[2] = industry
  const summaryRows = [
    { label: "Role type", value: answers[0]?.answer || "Full-time" },
    { label: "Location", value: answers[1]?.answer || "Remote" },
    { label: "Industry", value: answers[2]?.answer || "Tech" },
    { label: "Ranked by", value: "Portfolio match" },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Blurred scrim — kanban visible ghosted behind */}
      <motion.div
        className="absolute inset-0 bg-black/55 backdrop-blur-[6px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-[420px] bg-[#F5F2ED] dark:bg-[#1E1B18] rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.28)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden"
        initial={{ scale: 0.88, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 12, opacity: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#D4C5A9]/30 dark:from-white/[0.04] to-transparent pointer-events-none" />

        {/* Lottie animation */}
        <div className="flex justify-center pt-8 pb-3">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.5, type: "spring", bounce: 0.4 }}
            className="w-[88px] h-[88px]"
          >
            <Lottie animationData={aiAssistantAnimation} loop={true} />
          </motion.div>
        </div>

        {/* Hero text */}
        <motion.div
          className="text-center px-8 pb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-[26px] font-bold text-foreground leading-tight tracking-tight">
            We found{" "}
            <motion.span
              className="text-transparent bg-clip-text inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #5D3560 0%, #C04A38 40%, #E8882A 70%, #F5A623 100%)",
                backgroundSize: "200% auto",
                backgroundPosition: "0% center",
              }}
              initial={{ opacity: 0, backgroundPosition: "100% center" }}
              animate={{ opacity: 1, backgroundPosition: "0% center" }}
              transition={{ delay: 0.4, duration: 1.4, ease: "easeOut" }}
            >
              {count.toLocaleString()}
            </motion.span>{" "}
            {count === 1 ? "role" : "roles"}
            <br />
            that actually fit you.
          </h2>
          <p className="text-[13px] text-foreground/45 mt-2 leading-relaxed">
            Each one ranked by how well it matches your background.
          </p>
        </motion.div>

        {/* Preferences summary */}
        <motion.div
          className="mx-5 mb-5 rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.04] overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4 }}
        >
          <div className="px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.05]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30">
              Filtered for you
            </span>
          </div>
          {summaryRows.map((p, i, arr) => (
            <div
              key={p.label}
              className={`flex items-center justify-between px-4 py-2.5 ${
                i < arr.length - 1 ? "border-b border-black/[0.04] dark:border-white/[0.04]" : ""
              }`}
            >
              <span className="text-[13px] text-foreground/45">{p.label}</span>
              <span className="text-[13px] font-medium text-foreground/80 text-right max-w-[200px] truncate">
                {p.value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="px-5 pb-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.56, duration: 0.4 }}
        >
          <motion.button
            onClick={onConfirm}
            className="w-full h-[50px] rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[15px] font-semibold hover:opacity-85 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-black/20"
            whileTap={{ scale: 0.97 }}
          >
            Let&apos;s go
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
