import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Logo from "../../../public/assets/svgs/logo.svg";
import Link from "next/link";
import TrustedBySection from "@/components/trustedBySection";
import { useMeasuredHeight } from "@/hooks/useMeasuredHeight";
import MemoDesignfolioLogoV2 from "../icons/DesignfolioLogoV2";

export function AuthLayout({
  children,
  title,
  description,
  showBackButton = false,
  onBack,
  className = "",
}) {
  const [contentRef, contentHeight] = useMeasuredHeight();

  return (
    <div
      className="bg-background relative flex min-h-screen flex-col overflow-hidden"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      {/* Warm tinted 3x3 grid background */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 gap-8 overflow-hidden p-8">
        {/* Row 1 */}
        <div className="bg-muted rounded-[4rem]" />
        <div className="bg-muted rounded-[5rem] opacity-70" />
        <div className="bg-muted rounded-[4rem]" />

        {/* Row 2 */}
        <div className="bg-muted rounded-[5rem] opacity-70" />
        <div className="bg-muted rounded-[4rem]" />
        <div className="bg-muted rounded-[5rem] opacity-70" />

        {/* Row 3 */}
        <div className="bg-muted rounded-[4rem]" />
        <div className="bg-muted rounded-[5rem] opacity-70" />
        <div className="bg-muted rounded-[4rem]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex justify-center pt-8 pb-4">
          <Link href="/" className="cursor-pointer" data-testid="link-home">
            <MemoDesignfolioLogoV2 className="text-df-icon-color" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card
              className={`bg-card border-border overflow-hidden rounded-3xl border px-6 py-8 shadow-[0_0_40px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:px-8 ${className}`}
            >
              <motion.div
                initial={false}
                animate={{ height: contentHeight || "auto" }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                <div ref={contentRef}>
                  {showBackButton && (
                    <button
                      type="button"
                      onClick={onBack}
                      className="text-foreground/70 hover-elevate mb-6 -ml-2 flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:text-(--ring)"
                      data-testid="button-back"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Go Back
                    </button>
                  )}

                  {(title || description) && (
                    <div className="mb-8">
                      {title && (
                        <h1
                          className="text-foreground mb-2 text-center text-2xl font-semibold"
                          style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                        >
                          {title}
                        </h1>
                      )}
                      {description && (
                        <p className="text-foreground/60 text-center text-sm">{description}</p>
                      )}
                    </div>
                  )}
                  <AnimatePresence mode="wait" initial={false}>
                    {children}
                  </AnimatePresence>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        </div>

        <TrustedBySection classNames="from-background/30" />
      </div>
    </div>
  );
}
