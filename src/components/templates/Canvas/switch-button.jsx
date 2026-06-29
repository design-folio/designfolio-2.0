import { motion } from "motion/react";
import { useRef } from "react";
import { runThemeTransition } from "@/hooks/use-theme-switch-audio";

export function Switch({ value, onToggle, iconOn, iconOff, className = "", ...rest }) {
  const toggleRef = useRef(null);

  const handleToggle = () => {
    if (!toggleRef.current) return;
    runThemeTransition(toggleRef.current, onToggle, {
      playSound: true,
      ripple: true,
    });
  };

  return (
    <button
      ref={toggleRef}
      className={`flex w-10 cursor-pointer rounded-full bg-[#E5D7C4] p-0.5 dark:bg-[#6D5F4C] ${
        value ? "justify-end" : "justify-start"
      } ${className}`}
      onClick={handleToggle}
      {...rest}
    >
      <motion.div
        className="dark:bg-background dark:text-foreground flex size-5 items-center justify-center rounded-full bg-white text-[#1A1A1A]"
        layout
        transition={{
          type: "spring",
          duration: 0.6,
          bounce: 0.2,
        }}
      >
        {value ? (
          <motion.div
            key="on"
            initial={{ opacity: 0, rotate: -60 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 60 }}
            transition={{ duration: 0.3 }}
            className="text-foreground flex size-4 items-center justify-center"
          >
            {iconOn}
          </motion.div>
        ) : (
          <motion.div
            key="off"
            initial={{ opacity: 0, rotate: 60 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -60 }}
            transition={{ duration: 0.3 }}
            className="text-foreground flex size-4 items-center justify-center"
          >
            {iconOff}
          </motion.div>
        )}
      </motion.div>
    </button>
  );
}
