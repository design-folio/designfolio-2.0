"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { mapContentToUserDetails } from "@/lib/mapPendingPortfolioToUpdatePayload";
import Preview1 from "@/components/preview1";
import Cookies from "js-cookie";

const PENDING_PORTFOLIO_KEY = "pending-portfolio-data";

export function ResultPopup({ content, onClose }) {
  const router = useRouter();
  const isStructured = content && typeof content === "object" && !content.raw;
  const userDetailsFromContent = isStructured ? mapContentToUserDetails(content) : null;

  if (typeof document === "undefined" || !content) return null;

  const handleContinueClick = () => {
    if (!isStructured) {
      onClose();
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(PENDING_PORTFOLIO_KEY, JSON.stringify(content));
    }
    onClose();
    const isLoggedIn = !!Cookies.get("df-token");
    if (isLoggedIn) {
      router.push("/builder");
    } else {
      router.push("/login?redirect=/builder");
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-df-section-card-bg-color border-project-card-border-color shadow-df-section-card-shadow relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar - matches project card border */}
          <div className="bg-df-section-card-bg-color border-project-card-border-color flex h-12 min-w-0 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
            <div className="hidden w-[72px] shrink-0 gap-1.5 sm:flex">
              <div className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
              <div className="h-3 w-3 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
              <div className="h-3 w-3 rounded-full border border-[#1aab29] bg-[#27c93f]" />
            </div>
            <div className="flex min-w-0 flex-1 justify-center overflow-hidden">
              <div className="bg-project-card-bg-color border-project-card-border-color flex h-8 max-w-full min-w-0 items-center gap-2 rounded-lg border px-3 sm:px-4">
                <Lock className="text-foreground/40 h-3 w-3 shrink-0" />
                <span className="text-foreground/40 truncate text-[11px] font-medium">
                  your-new-portfolio.designfolio.me
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2">
              {isStructured && (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-border/50 h-8 shrink-0 rounded-full px-3 text-xs font-bold transition-all focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 sm:px-4"
                    data-testid="button-discard"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={handleContinueClick}
                    className="h-8 shrink-0 rounded-full bg-[#FF553E] px-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#FF553E]/90 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 sm:px-4"
                    data-testid="button-continue-signup"
                  >
                    Open Editor
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="bg-df-bg-color min-h-0 flex-1 overflow-y-auto">
            {isStructured && userDetailsFromContent ? (
              <Preview1 userDetails={userDetailsFromContent} projectRef={null} embeddedPreview />
            ) : (
              <div className="p-4 lg:p-6">
                <pre className="bg-df-section-card-bg-color border-project-card-border-color overflow-x-auto rounded-2xl border p-4 font-mono text-sm whitespace-pre-wrap lg:p-6">
                  {content?.raw || JSON.stringify(content, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {isStructured && (
            <div className="relative shrink-0">
              <div className="from-df-bg-color pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t to-transparent" />
              <div className="bg-df-bg-color border-project-card-border-color flex items-center justify-center border-t px-4 py-4 lg:px-6">
                <span className="text-foreground/50 text-[11px] tracking-wide">
                  This is a preview —{" "}
                  <button
                    type="button"
                    onClick={handleContinueClick}
                    className="font-medium text-[#FF553E] underline underline-offset-2 transition-colors hover:text-[#E64935]"
                    data-testid="link-open-editor-footer"
                  >
                    Open Editor
                  </button>{" "}
                  to save and publish your portfolio
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
