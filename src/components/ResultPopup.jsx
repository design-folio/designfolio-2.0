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
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8">
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
          className="relative w-full max-w-5xl h-[90vh] bg-background border-[6px] border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chrome-style Top Bar */}
          <div className="bg-[#f1f3f4] dark:bg-[#202124] border-b border-border/50 flex items-center h-12 px-4 shrink-0">
            <div className="flex gap-1.5 w-[72px]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
            </div>
            <div className="flex-1 flex justify-center px-4">
              <div className="bg-white dark:bg-[#2a2a2a] rounded-lg h-8 px-4 flex items-center gap-2 border border-black/5 dark:border-white/5 w-fit min-w-[240px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <Lock className="w-3 h-3 text-foreground/40" />
                <span className="text-[11px] text-foreground/40 font-medium truncate">
                  your-new-portfolio.designfolio.me
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              {isStructured && (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="rounded-full h-8 px-4 text-xs font-bold border-border/50 transition-all focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    data-testid="button-discard"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={handleContinueToSignup}
                    className="bg-[#FF553E] hover:bg-[#FF553E]/90 text-white rounded-full h-8 px-4 text-xs font-bold shadow-sm transition-all focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    data-testid="button-continue-signup"
                  >
                    Open Editor
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {isStructured && userDetails ? (
              <Preview1
                userDetails={userDetails}
                projectRef={null}
                embeddedPreview
              />
            ) : (
              <div className="p-6 sm:p-10 bg-[#F8F7F5]">
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                  {content?.raw || JSON.stringify(content, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {isStructured && (
            <div className="relative shrink-0">
              <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#F8F7F5] to-transparent pointer-events-none" />
              <div className="bg-[#F8F7F5] px-4 py-3 flex items-center justify-center">
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
