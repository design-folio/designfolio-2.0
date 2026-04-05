import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BlurHoverText from "./shared/BlurHoverText";
import LandingLogoSVG from "./shared/LandingLogoSVG";

export default function LandingHeader({ showNavCTA, dfToken }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[--lp-bg] md:bg-[color-mix(in_srgb,var(--lp-bg)_95%,transparent)] md:backdrop-blur before:absolute before:content-[''] before:inset-x-[-100vw] before:bottom-0 before:h-px before:bg-[--lp-border]">
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Mobile: logo + /designfolio */}
        <div className="flex md:hidden items-center gap-2">
          <LandingLogoSVG size={24} id="header-logo" />
          <span
            className="text-[14px] font-bold tracking-tight text-[--lp-text]"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            /designfolio
          </span>
        </div>

        {/* Desktop: user stats */}
        <div
          className="hidden md:flex text-[13px] font-semibold tracking-wide text-[--lp-text]/70 uppercase h-[20px] items-center min-w-[200px]"
          style={{ fontFamily: '"DM Mono", monospace' }}
        >
          <BlurHoverText
            defaultText="25000+ USERS"
            hoverText="5000+ PORTFOLIOS LAUNCHED"
            scrollActive={showNavCTA}
          />
        </div>

        <div className="flex items-center">
          {!dfToken && (
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-full px-5 h-8 text-[13px] font-medium border-[--lp-border] hover:bg-black/5 dark:hover:bg-white/5 bg-transparent text-[--lp-text]"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                Login
              </Button>
            </Link>
          )}

          <AnimatePresence>
            {showNavCTA && (
              <motion.div
                key="nav-cta"
                initial={{ opacity: 0, maxWidth: 0, marginLeft: 0 }}
                animate={{ opacity: 1, maxWidth: 180, marginLeft: 8 }}
                exit={{ opacity: 0, maxWidth: 0, marginLeft: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden flex-shrink-0 flex"
              >
                <Link
                  href={dfToken ? "/builder" : "/claim-link"}
                  className="group inline-flex cursor-pointer items-center gap-0 rounded-full no-underline"
                >
                  <span className="rounded-full bg-[--lp-text] px-4 py-[6px] text-[13px] font-medium text-[--lp-fg-white] transition-colors duration-500 ease-in-out group-hover:bg-[--lp-accent-hover] group-hover:text-white whitespace-nowrap">
                    {dfToken ? "Launch Builder" : "Get Started"}
                  </span>
                  <div className="relative h-[32px] w-[32px] flex-shrink-0 overflow-hidden rounded-full bg-[--lp-text] text-[--lp-fg-white] transition-colors duration-500 ease-in-out group-hover:bg-[--lp-accent-hover] group-hover:text-white">
                    <ArrowUpRight className="absolute top-1/2 left-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-6" strokeWidth={2.5} />
                    <ArrowUpRight className="absolute top-1/2 left-1/2 h-[14px] w-[14px] -translate-x-7 translate-y-7 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2 group-hover:-translate-y-1/2" strokeWidth={2.5} />
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
