import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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
      className="w-full px-6 pt-12 pb-12 flex flex-col items-center text-center"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      {/* LayoutGroup scopes layoutId to this component — prevents page-wide layout recalculation */}
      <LayoutGroup id="hero-tabs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 inline-flex items-center rounded-full border border-lp-text/10 bg-lp-text/[0.04] dark:bg-[--lp-card] dark:border-[--lp-border] p-0.5"
        >
          {["resume", "scratch"].map((tab) => (
            <button
              key={tab}
              onClick={() => setHeroTab(tab)}
              className={cn(
                "relative px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors duration-200",
                heroTab === tab
                  ? "text-[--lp-text]"
                  : "text-lp-text/45 hover:text-lp-text/70"
              )}
            >
              {heroTab === tab && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-[--lp-surface] border border-lp-text/10 shadow-sm"
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

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
        className="text-[35px] sm:text-[45px] leading-[1.1] tracking-[-0.02em] max-w-[520px] mb-5 text-[--lp-heading]"
        style={{ fontWeight: 650 }}
      >
        Building a portfolio was never meant to be hard.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-[17px] mb-8 max-w-[450px] leading-relaxed font-semibold text-[--lp-text-muted]"
      >
        {heroTab === "resume"
          ? "Upload your resume. AI builds your portfolio and matches you with jobs."
          : "Pick your domain and start building your portfolio from scratch — no resume needed."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="w-full max-w-[450px] flex flex-col items-center"
      >
        {/*
          ResumeUploadZone is always mounted to prevent the backdrop-filter portal from
          creating/destroying a GPU compositing layer on every tab switch, which caused
          the whole-page "remount" flicker.
        */}
        <div className={heroTab === "resume" ? "w-full flex justify-center" : "hidden"}>
          <ResumeUploadZone
            hasDfToken={hasDfToken}
            hasParsedResume={hasParsedResume}
            onPrimaryCta={onPrimaryCta}
            primaryCtaLabel={primaryCtaLabel}
            primaryCtaLoading={primaryCtaLoading}
          />
        </div>

        {heroTab === "scratch" && (
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
                <ClaimDomain  />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </section>
  );
}
