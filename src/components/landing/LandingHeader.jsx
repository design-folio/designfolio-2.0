import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingLogoSVG from "./shared/LandingLogoSVG";
import ArrowCTA from "./shared/ArrowCTA";
import BuiltForTypewriter from "./shared/BuiltForTypewriter";

export default function LandingHeader({
  showNavCTA,
  dfToken,
  ctaLabel,
  ctaDest,
  onPrimaryCta,
  primaryCtaLoading,
}) {
  return (
    <header className="sticky top-0 z-[200] w-full bg-[--lp-bg] md:bg-[color-mix(in_srgb,var(--lp-bg)_95%,transparent)] md:backdrop-blur before:absolute before:content-[''] before:inset-x-[-100vw] before:bottom-0 before:h-px before:bg-[--lp-border]">
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
          className="hidden md:flex text-[13px] font-semibold tracking-wide text-lp-text/70 uppercase h-[20px] items-center min-w-[200px]"
          style={{ fontFamily: '"DM Mono", monospace' }}
        >
          <BuiltForTypewriter />
        </div>

        <div className="flex items-center">
          {!dfToken && (
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-full px-5 h-8 text-[13px] font-medium border-[--lp-border] hover:bg-black/5 bg-transparent text-[--lp-text] shadow-none"
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
                <ArrowCTA
                  label={ctaLabel || "Get Started"}
                  size="sm"
                  href={ctaDest || undefined}
                  onClick={!ctaDest ? onPrimaryCta : undefined}
                  loading={primaryCtaLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
