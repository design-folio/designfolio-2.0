import { motion } from "framer-motion";

export function Waveform({ listening }) {
  const bars = Array.from({ length: 28 });
  return (
    <div className="flex items-center justify-center gap-[3px] h-14">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-foreground/60"
          animate={
            listening
              ? {
                  height: [
                    `${8 + Math.random() * 8}px`,
                    `${20 + Math.random() * 30}px`,
                    `${8 + Math.random() * 8}px`,
                  ],
                  opacity: [0.4, 1, 0.4],
                }
              : { height: "6px", opacity: 0.25 }
          }
          transition={
            listening
              ? {
                  duration: 0.6 + Math.random() * 0.6,
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
