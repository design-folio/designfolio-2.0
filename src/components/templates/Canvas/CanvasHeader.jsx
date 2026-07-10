import React, { useEffect, useState, startTransition } from "react";
import { motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "./switch-button";
import { usePersistableThemeToggle } from "@/hooks/usePersistableThemeToggle";

function CanvasHeader({ persistTheme = false }) {
  const [currentTime, setCurrentTime] = useState(null);
  const { isDark, toggleTheme } = usePersistableThemeToggle(persistTheme);

  useEffect(() => {
    startTransition(() => setCurrentTime(new Date()));
    const timer = setInterval(() => startTransition(() => setCurrentTime(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDate =
    currentTime?.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0 }}
      className="flex w-full items-center justify-between rounded-[26px] border border-[#E5D7C4] bg-white px-4 py-2 dark:border-white/10 dark:bg-[#2A2520]"
    >
      <div className="flex items-center gap-2">
        <span className="text-scaled-14 font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
          {currentDate}
        </span>
        <div className="h-2 w-2 rotate-45 bg-[#E37941]"></div>
        <span className="text-scaled-14 font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
          {currentTime?.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) ?? ""}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          value={isDark}
          onToggle={toggleTheme}
          iconOn={<Moon className="size-4" />}
          iconOff={<Sun className="size-4" />}
        />
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasHeader);
