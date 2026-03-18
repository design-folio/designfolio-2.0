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
      className={`flex w-12 cursor-pointer rounded-full p-0.5 bg-[#E5D7C4] dark:bg-[#6D5F4C] ${
        value ? "justify-end" : "justify-start"
      } ${className}`}
      onClick={handleToggle}
      {...rest}
    >
      <motion.div
        className="flex justify-center items-center size-6 rounded-full bg-white dark:bg-background text-[#1A1A1A] dark:text-foreground"
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
            className="flex justify-center items-center size-5 text-foreground"
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
            className="flex justify-center items-center size-5 text-foreground"
          >
            {iconOff}
          </motion.div>
        )}
      </motion.div>
    </button>
  );
}
