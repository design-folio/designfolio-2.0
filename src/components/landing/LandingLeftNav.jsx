import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import LandingLogoSVG from "./shared/LandingLogoSVG";

const NAV_LINKS = [
  { id: "overview", label: "Overview" },
  { id: "stories", label: "Stories" },
  { id: "how", label: "How?" },
  { id: "why", label: "Why?" },
];

export default function LandingLeftNav({
  activeSection,
  onSectionClick,
  isDark,
  onThemeChange,
  containerRef,
}) {
  return (
    <div className="hidden lg:block absolute right-full top-0 bottom-0 z-40">
      <div className="sticky top-[120px] flex flex-col items-start pr-12 w-max">
        {/* Animated logo */}
        <div className="absolute top-0 left-0 w-9 h-9 z-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <LandingLogoSVG size={36} id="leftnav-logo" />
          </motion.div>
        </div>

        {/* Sliding container */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 52 }}
          transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col relative z-10 bg-[--lp-bg] w-full"
        >
          {/* /Designfolio wordmark */}
          <div
            className="font-bold text-[15px] tracking-tight text-[--lp-text] flex items-center h-9 pr-4 bg-[--lp-bg]"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            <span className="mr-1.5">/</span>
            <motion.span
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.4 },
                },
              }}
              className="flex"
            >
              {"Designfolio".split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </div>

          {/* Theme toggle */}
          <div ref={containerRef} className="group inline-flex items-center gap-2 mt-4 mb-4">
            <span
              className={cn(
                "cursor-pointer text-sm transition-colors",
                isDark ? "text-[--lp-text]/30" : "text-[--lp-text]",
              )}
              onClick={() => onThemeChange(false)}
            >
              <Sun className="size-4" aria-hidden="true" />
            </span>
            <span className="inline-flex [&_button>span]:!bg-background">
              <Switch
                checked={isDark}
                onCheckedChange={onThemeChange}
                aria-label="Toggle dark/light mode"
                className="data-[state=checked]:bg-[#1A1A1A] dark:data-[state=checked]:bg-[#DDD1C4]"
              />
            </span>
            <span
              className={cn(
                "cursor-pointer text-sm transition-colors",
                !isDark ? "text-[--lp-text]/30" : "text-[--lp-text]",
              )}
              onClick={() => onThemeChange(true)}
            >
              <Moon className="size-4" aria-hidden="true" />
            </span>
          </div>

          {/* Section nav */}
          <nav
            className="flex flex-col gap-2.5 text-[15px] font-medium text-[--lp-text]/50 pb-4 bg-[--lp-bg]"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            {NAV_LINKS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSectionClick(id, id === "stories" ? "center" : "start");
                }}
                className={cn(
                  "transition-colors cursor-pointer",
                  activeSection === id
                    ? "text-[--lp-accent] font-semibold"
                    : "hover:text-[--lp-text]",
                )}
              >
                {label}
              </a>
            ))}
          </nav>
        </motion.div>
      </div>
    </div>
  );
}
