import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "./switch-button";

function CanvasHeader() {
  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = mounted && theme === "dark";

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDate = currentTime?.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }) ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0 }}
      className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[24px] border border-[#E5D7C4] dark:border-white/10 py-2 px-4 flex justify-between items-center w-full"
    >
      <div className="flex items-center gap-2">
        <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
          {currentDate}
        </span>
        <div className="w-2 h-2 bg-[#E37941] rotate-45"></div>
        <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-sm">
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
          onToggle={() => setTheme(isDark ? "light" : "dark")}
          iconOn={<Moon className="size-4" />}
          iconOff={<Sun className="size-4" />}
        />
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasHeader);
