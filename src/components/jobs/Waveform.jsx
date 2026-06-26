import { useState } from "react";
import { motion } from "motion/react";

const BAR_COUNT = 28;

function makeBarParams() {
  return Array.from({ length: BAR_COUNT }, () => ({
    minHeight: 8 + Math.random() * 8,
    maxHeight: 20 + Math.random() * 30,
    minHeight2: 8 + Math.random() * 8,
    duration: 0.6 + Math.random() * 0.6,
  }));
}

export function Waveform({ listening }) {
  const [barParams] = useState(makeBarParams);

  return (
    <div className="flex items-center justify-center gap-[3px] h-14">
      {barParams.map((p, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-foreground/60"
          animate={
            listening
              ? {
                  height: [`${p.minHeight}px`, `${p.maxHeight}px`, `${p.minHeight2}px`],
                  opacity: [0.4, 1, 0.4],
                }
              : { height: "6px", opacity: 0.25 }
          }
          transition={
            listening
              ? {
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.04,
                }
              : { duration: 0.4 }
          }
        />
      ))}
    </div>
  );
}
