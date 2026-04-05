"use client";
import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Shows defaultText by default. On hover (or when scrollActive=true),
 * blurs out the default text and reveals hoverText word-by-word.
 */
export default function BlurHoverText({ defaultText, hoverText, scrollActive }) {
  const [isHovered, setIsHovered] = useState(false);
  const showHoverText = isHovered !== !!scrollActive;

  return (
    <div
      className="relative cursor-default inline-flex h-full items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-[0.3em] items-center whitespace-nowrap">
        {defaultText.split(" ").map((word, i) => (
          <motion.span
            key={i}
            animate={{
              opacity: showHoverText ? 0 : 1,
              filter: showHoverText ? "blur(4px)" : "blur(0px)",
            }}
            transition={{ duration: 0.3, delay: showHoverText ? 0 : i * 0.08 }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      <div className="absolute left-0 flex gap-[0.3em] whitespace-nowrap pointer-events-none">
        {hoverText.split(" ").map((word, i) => (
          <motion.span
            key={i}
            animate={{
              opacity: showHoverText ? 1 : 0,
              filter: showHoverText ? "blur(0px)" : "blur(4px)",
            }}
            transition={{ duration: 0.3, delay: showHoverText ? i * 0.08 : 0 }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
