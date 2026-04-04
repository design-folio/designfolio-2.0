import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingFAB({ fabVisible, isDark, onThemeChange, fabRef }) {
  return (
    <AnimatePresence>
      {fabVisible && (
        <motion.div
          ref={fabRef}
          key="theme-fab"
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[9999] lg:hidden"
        >
          <button
            onClick={() => onThemeChange(!isDark)}
            aria-label="Toggle theme"
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-colors duration-300",
              isDark
                ? "bg-[#2A2825] text-[#F0EDE7] border border-white/10 hover:bg-[#343230]"
                : "bg-white text-[#1D1B1A] border border-black/[0.08] hover:bg-[#F5F4EE]",
            )}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.span
                  key="moon"
                  initial={{ rotate: -40, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 40, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <Moon className="size-[18px]" />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotate: 40, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -40, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <Sun className="size-[18px]" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
