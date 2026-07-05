import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";
import ResumeUploadZone from "./ResumeUploadZone";
import ClaimDomain from "../claimDomain";
import ArrowCTA from "./shared/ArrowCTA";

export default function LandingHeroSection({
  hasDfToken,
  hasParsedResume,
  onPrimaryCta,
  primaryCtaLabel,
  primaryCtaLoading,
}) {
  const [heroTab, setHeroTab] = useState("resume");

  return (
    <section
      className="flex w-full flex-col items-center px-6 pt-12 pb-12 text-center"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      {/* LayoutGroup scopes layoutId to this component — prevents page-wide layout recalculation */}
      {!hasDfToken && (
        <LayoutGroup id="hero-tabs">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="border-lp-text/10 bg-lp-text/[0.04] mb-6 inline-flex items-center rounded-full border p-0.5 dark:border-(--lp-border) dark:bg-(--lp-card)"
          >
            {["resume", "scratch"].map((tab) => (
              <button
                key={tab}
                onClick={() => setHeroTab(tab)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors duration-200",
                  heroTab === tab ? "text-(--lp-text)" : "text-lp-text/45 hover:text-lp-text/70"
                )}
              >
                {heroTab === tab && (
                  <motion.span
                    layoutId="tab-pill"
                    className="border-lp-text/10 absolute inset-0 rounded-full border bg-(--lp-surface) shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative z-10 cursor-pointer">
                  {tab === "resume" ? "Use Resume" : "From Scratch"}
                </span>
              </button>
            ))}
          </motion.div>
        </LayoutGroup>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
        className="dark:text-foreground mb-5 max-w-[660px] text-center text-[35px] leading-[1.1] tracking-[-0.02em] text-balance text-(--lp-heading) text-[#463B34] sm:text-[45px]"
        style={{ fontWeight: 650 }}
      >
        Building a portfolio was never meant to be hard.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mb-8 max-w-[572px] text-[17px] leading-relaxed font-semibold text-(--lp-text-muted)"
      >
        {heroTab === "resume" || hasDfToken
          ? "Upload your resume. We'll turn it into a portfolio website and match you with jobs that fit your experience."
          : "Pick your domain. AI helps you build a portfolio and powers your job search."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="flex w-full max-w-[450px] flex-col items-center"
      >
        {/*
          ResumeUploadZone is always mounted to prevent the backdrop-filter portal from
          creating/destroying a GPU compositing layer on every tab switch, which caused
          the whole-page "remount" flicker.
        */}
        <div
          className={heroTab === "resume" || hasDfToken ? "flex w-full justify-center" : "hidden"}
        >
          <ResumeUploadZone
            hasDfToken={hasDfToken}
            hasParsedResume={hasParsedResume}
            onPrimaryCta={onPrimaryCta}
            primaryCtaLabel={primaryCtaLabel}
            primaryCtaLoading={primaryCtaLoading}
          />
        </div>

        {!hasDfToken && heroTab === "scratch" && (
          <AnimatePresence mode="wait">
            {hasDfToken || hasParsedResume ? (
              <motion.div
                key="scratch-cta"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-2.5"
              >
                <ArrowCTA
                  label={primaryCtaLabel}
                  size="lg"
                  onClick={onPrimaryCta}
                  loading={primaryCtaLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="scratch-domain"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <ClaimDomain />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </section>
  );
}
