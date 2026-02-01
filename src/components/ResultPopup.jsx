"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Building, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/router";

const PENDING_PORTFOLIO_KEY = "pending-portfolio-data";

export function ResultPopup({ content, onClose }) {
  const router = useRouter();
  const isStructured = content && typeof content === "object" && !content.raw;

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
          className="relative w-full max-w-5xl max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
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
              <div className="bg-white dark:bg-[#2a2a2a] rounded-lg h-8 px-4 flex items-center gap-2 border border-black/5 dark:border-white/5 w-fit min-w-[240px]">
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
                    className="rounded-full h-8 px-4 text-xs font-bold"
                    data-testid="button-discard"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={handleContinueToSignup}
                    className="bg-[#FF553E] hover:bg-[#E64935] text-white rounded-full h-8 px-4 text-xs font-bold"
                    data-testid="button-continue-signup"
                  >
                    Continue to sign up
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#F8F7F5]">
            {isStructured ? (
              <div className="max-w-4xl mx-auto space-y-3">
                {/* Profile Card */}
                <Card className="bg-white border-0 rounded-2xl shadow-sm overflow-hidden">
                  <CardContent className="p-6 sm:p-8 pb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                      <div
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center shrink-0 bg-[#F5F3F1] overflow-hidden"
                        data-testid="avatar-profile"
                      >
                        <img
                          src="/assets/png/designfolio-thumbnail.png"
                          alt={content.user?.name}
                          className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-foreground font-gsans">
                          {content.user?.name || "Your name"}
                        </h1>
                        <p className="text-sm sm:text-base text-foreground/60 leading-relaxed max-w-2xl">
                          {content.user?.role ||
                            "A short professional tagline will appear here."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <div className="border-t border-border/10 py-3 bg-[#F8F7F5] rounded-b-2xl px-4">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {(content.user?.categories || []).map((cat, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground/70 uppercase tracking-normal"
                        >
                          {cat}
                          <Sparkle className="w-2.5 h-2.5 text-foreground/50" />
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Case Studies */}
                {content.caseStudies?.length > 0 && (
                  <Card className="bg-white border-0 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-medium text-foreground/60 uppercase tracking-wider mb-4">
                      My works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.caseStudies.map((project, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-border p-4 bg-white"
                        >
                          <span className="text-[10px] font-medium bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full uppercase">
                            {project.category}
                          </span>
                          <h3 className="font-semibold text-foreground mt-2 line-clamp-2">
                            {project.title}
                          </h3>
                          <p className="text-xs text-foreground/60 line-clamp-2 mt-1">
                            {project.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Work Experience */}
                {content.workExperiences?.length > 0 && (
                  <Card className="bg-white border-0 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-medium text-foreground/60 uppercase tracking-wider mb-4">
                      Work Experience
                    </h2>
                    <div className="space-y-4">
                      {content.workExperiences.map((exp, idx) => (
                        <div
                          key={idx}
                          className={idx > 0 ? "pt-4 border-t border-border/10" : ""}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-2 md:gap-4">
                            <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                              {exp.period}
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                <span className="font-semibold text-foreground">
                                  {exp.role}
                                </span>
                                <span className="text-foreground/40">at</span>
                                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                                  <Building className="w-4 h-4 text-foreground/40" />
                                  {exp.company}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/70 leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* About Me */}
                {content.user?.aboutMe && (
                  <Card className="bg-white border-0 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-medium text-foreground/60 uppercase tracking-wider mb-4">
                      About Me
                    </h2>
                    <p className="text-foreground/80 leading-relaxed">
                      {content.user.aboutMe}
                    </p>
                  </Card>
                )}

                {/* Footer contact */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border-0">
                  <div className="space-y-2">
                    {content.user?.contact?.email && (
                      <div className="flex justify-between items-center py-2 border-b border-border/10">
                        <span className="text-sm text-foreground/50">Mail</span>
                        <a
                          href={`mailto:${content.user.contact.email}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {content.user.contact.email}
                        </a>
                      </div>
                    )}
                    {content.user?.contact?.phone && (
                      <div className="flex justify-between items-center py-2 border-b border-border/10">
                        <span className="text-sm text-foreground/50">Phone</span>
                        <span className="text-sm font-medium">
                          {content.user.contact.phone}
                        </span>
                      </div>
                    )}
                    {content.user?.contact?.location && (
                      <div className="flex justify-between items-center py-2 border-b border-border/10">
                        <span className="text-sm text-foreground/50">
                          Location
                        </span>
                        <span className="text-sm font-medium">
                          {content.user.contact.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                {content?.raw || JSON.stringify(content, null, 2)}
              </pre>
            )}
          </div>

          {isStructured && (
            <div className="bg-[#F8F7F5] px-4 py-3 flex items-center justify-center border-t border-border/50">
              <span className="text-[11px] text-foreground/50">
                This is a preview —{" "}
                <button
                  type="button"
                  onClick={handleContinueToSignup}
                  className="text-[#FF553E] hover:underline font-medium"
                >
                  Continue to sign up
                </button>{" "}
                to save and publish your portfolio
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
