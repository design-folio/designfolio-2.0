import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import LandingLogoSVG from "./shared/LandingLogoSVG";

const NAV_LINKS = [
  { id: "overview", label: "Start here" },
  { id: "stories", label: "Success stories" },
  { id: "how", label: "How it works" },
  { id: "why", label: "Meet Shai" },
];

export default function LandingLeftNav({
  activeSection,
  onSectionClick,
  isDark,
  onThemeChange,
  containerRef,
}) {
  return (
    <div className="absolute top-0 right-full bottom-0 z-40 hidden lg:block">
      <div className="sticky top-[120px] flex w-max flex-col items-start pr-12">
        {/* Animated logo */}
        <div className="absolute top-0 left-0 z-0 h-9 w-9">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            <LandingLogoSVG size={36} id="leftnav-logo" />
          </motion.div>
        </div>

        {/* Sliding container */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 52 }}
          transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex w-full flex-col bg-(--lp-bg)"
        >
          {/* /Designfolio wordmark */}
          <div
            className="flex h-9 items-center bg-(--lp-bg) pr-4 text-[15px] font-bold tracking-tight text-(--lp-text)"
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
          <div ref={containerRef} className="group mt-4 mb-4 inline-flex items-center gap-2">
            <span
              className={cn(
                "cursor-pointer text-sm transition-colors",
                isDark ? "text-lp-text/30" : "text-(--lp-text)"
              )}
              onClick={() => onThemeChange(false)}
            >
              <Sun className="size-4" aria-hidden="true" />
            </span>
            <span className="[&_button>span]:!bg-background inline-flex">
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
                !isDark ? "text-lp-text/30" : "text-(--lp-text)"
              )}
              onClick={() => onThemeChange(true)}
            >
              <Moon className="size-4" aria-hidden="true" />
            </span>
          </div>

          {/* Section nav */}
          <nav
            className="text-lp-text/50 flex flex-col gap-2.5 bg-(--lp-bg) pb-4 text-[15px] font-medium"
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
                  "cursor-pointer transition-colors",
                  activeSection === id
                    ? "font-semibold text-(--lp-accent)"
                    : "hover:text-(--lp-text)"
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
