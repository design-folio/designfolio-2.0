import { AnimatePresence, motion } from "motion/react";
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
    <header className="sticky top-0 z-[200] w-full bg-(--lp-bg) before:absolute before:inset-x-[-100vw] before:bottom-0 before:h-px before:bg-(--lp-border) before:content-[''] md:bg-[color-mix(in_srgb,var(--lp-bg)_95%,transparent)] md:backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Mobile: logo + /designfolio */}
        <div className="flex items-center gap-2 md:hidden">
          <LandingLogoSVG size={24} id="header-logo" />
          <span
            className="text-[14px] font-bold tracking-tight text-(--lp-text)"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            /designfolio
          </span>
        </div>

        {/* Desktop: user stats */}
        <div className="text-lp-text/70 hidden h-[20px] min-w-[200px] items-center text-[13px] font-semibold tracking-wide uppercase md:flex">
          <BuiltForTypewriter />
        </div>

        <div className="flex items-center">
          {!dfToken && (
            <Link href="/login">
              <Button
                variant="outline"
                className="h-8 rounded-full border-(--lp-border) bg-transparent px-5 text-[13px] font-medium text-(--lp-text) shadow-none hover:bg-black/5"
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
                className="flex shrink-0 overflow-hidden"
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
