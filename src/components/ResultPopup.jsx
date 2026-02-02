"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { mapContentToUserDetails } from "@/lib/mapPendingPortfolioToUpdatePayload";
import Preview1 from "@/components/preview1";

const PENDING_PORTFOLIO_KEY = "pending-portfolio-data";

export function ResultPopup({ content, onClose }) {
  const router = useRouter();
  const isStructured = content && typeof content === "object" && !content.raw;
  const userDetails = isStructured ? mapContentToUserDetails(content) : null;

  if (typeof document === "undefined" || !content) return null;

  const handleContinueToSignup = () => {
    if (isStructured) {
      if (typeof window !== "undefined") {
        localStorage.setItem(PENDING_PORTFOLIO_KEY, JSON.stringify(content));
      }
      onClose();
      router.push("/claim-link");
    } else {
      onClose();
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
          className="relative w-full max-w-5xl h-[90vh] bg-df-section-card-bg-color border border-project-card-border-color rounded-2xl shadow-df-section-card-shadow flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar - matches project card border */}
          <div className="bg-df-section-card-bg-color border-b border-project-card-border-color flex items-center h-12 px-4 lg:px-6 shrink-0 gap-2 min-w-0">
            <div className="hidden sm:flex gap-1.5 w-[72px] shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
            </div>
            <div className="flex-1 min-w-0 flex justify-center overflow-hidden">
              <div className="bg-project-card-bg-color rounded-lg h-8 px-3 sm:px-4 flex items-center gap-2 border border-project-card-border-color min-w-0 max-w-full">
                <Lock className="w-3 h-3 text-foreground/40 shrink-0" />
                <span className="text-[11px] text-foreground/40 font-medium truncate">
                  your-new-portfolio.designfolio.me
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end shrink-0">
              {isStructured && (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="rounded-full h-8 px-3 sm:px-4 text-xs font-bold border-border/50 transition-all focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shrink-0"
                    data-testid="button-discard"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={handleContinueToSignup}
                    className="bg-[#FF553E] hover:bg-[#FF553E]/90 text-white rounded-full h-8 px-3 sm:px-4 text-xs font-bold shadow-sm transition-all focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shrink-0"
                    data-testid="button-continue-signup"
                  >
                    Open Editor
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-df-bg-color">
            {isStructured && userDetails ? (
              <Preview1
                userDetails={userDetails}
                projectRef={null}
                embeddedPreview
              />
            ) : (
              <div className="p-4 lg:p-6">
                <pre className="p-4 lg:p-6 bg-df-section-card-bg-color border border-project-card-border-color rounded-2xl overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                  {content?.raw || JSON.stringify(content, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {isStructured && (
            <div className="relative shrink-0">
              <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-df-bg-color to-transparent pointer-events-none" />
              <div className="bg-df-bg-color border-t border-project-card-border-color px-4 lg:px-6 py-4 flex items-center justify-center">
                <span className="text-[11px] text-foreground/50 tracking-wide">
                  This is a preview —{" "}
                  <button
                    type="button"
                    onClick={handleContinueToSignup}
                    className="text-[#FF553E] hover:text-[#E64935] font-medium underline underline-offset-2 transition-colors"
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
