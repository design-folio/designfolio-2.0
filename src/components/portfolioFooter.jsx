import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttonNew";
import { Pencil, ThumbsUp, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getWallpaperUrl } from "@/lib/wallpaper";
import { useTheme } from "next-themes";
import { modals } from "@/lib/constant";

// CrypticText component for animated text
const CrypticText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text.split('').map(() => ''));
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const targetChars = text.split('');
    let iteration = 0;

    const interval = setInterval(() => {
      setDisplayText((prev) =>
        targetChars.map((char, index) => {
          if (index < iteration) {
            return targetChars[index];
          }
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
      );

      iteration += 1 / 3;

      if (iteration >= targetChars.length) {
        clearInterval(interval);
        setDisplayText(targetChars);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, text]);

  return (
    <span ref={containerRef} className={className}>
      {displayText.join('')}
    </span>
  );
};

export default function PortfolioFooter({ userDetails, edit, openModal, openSidebar }) {
  const { resolvedTheme } = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);

  const { resume, socials, portfolios } = userDetails || {};
  // Get email and phone from userDetails (may need to be added to userDetails structure)
  const email = userDetails?.email || userDetails?.contact?.email;
  const phone = userDetails?.phone || userDetails?.contact?.phone;

  // Get wallpaper URL for mask effect
  const wp = userDetails?.wallpaper;
  const wpValue = (wp && typeof wp === 'object') ? (wp.url || wp.value) : wp;
  const currentTheme = resolvedTheme || 'light';
  const wallpaperUrl = wpValue && wpValue !== 0 ? getWallpaperUrl(wpValue, currentTheme) : null;
  const selectedWallpaper = wallpaperUrl;

  // Generate wallpaper mask pattern (pegboard effect)
  const getWallpaperMask = () => {
    if (!selectedWallpaper) return {};
    
    const positions = [];
    const stepY = 5.882352941176471;
    const stepX = 2.5641025641025643;
    
    // Left side positions (0% to 100% vertical)
    for (let i = stepY; i < 100; i += stepY) {
      positions.push(`radial-gradient(circle at 0% ${i}%, transparent 5.5px, black 5.5px)`);
    }
    // Right side positions
    for (let i = stepY; i < 100; i += stepY) {
      positions.push(`radial-gradient(circle at 100% ${i}%, transparent 5.5px, black 5.5px)`);
    }
    // Top positions (0% to 100% horizontal)
    for (let i = stepX; i < 100; i += stepX) {
      positions.push(`radial-gradient(circle at ${i}% 0%, transparent 5.5px, black 5.5px)`);
    }
    // Bottom positions
    for (let i = stepX; i < 100; i += stepX) {
      positions.push(`radial-gradient(circle at ${i}% 100%, transparent 5.5px, black 5.5px)`);
    }

    return {
      WebkitMaskImage: positions.join(', '),
      WebkitMaskComposite: 'source-in'
    };
  };

  const handleCopyPhone = () => {
    if (phone) {
      navigator.clipboard.writeText(phone);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Get user name for copyright
  const getUserName = () => {
    if (userDetails?.firstName && userDetails?.lastName) {
      return `${userDetails.firstName.toUpperCase()} ${userDetails.lastName.toUpperCase()}`;
    }
    if (userDetails?.firstName) {
      return userDetails.firstName.toUpperCase();
    }
    return "DESIGNFOLIO";
  };

  return (
    <>
      <motion.footer
        id="footer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="pb-20"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="relative bg-df-section-card-bg-color p-8 shadow-df-section-card-shadow rounded-2xl overflow-hidden"
            style={selectedWallpaper ? getWallpaperMask() : {}}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                {/* Resume */}
                {(resume || edit) && (
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-2.5 border-b border-border/10 group gap-1 sm:gap-4"
                    data-testid="footer-item-resume"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0 }}
                  >
                    <span className="text-sm sm:text-base text-foreground-landing/50 dark:text-foreground-landing/60">Resume</span>
                    {resume?.url ? (
                      <button
                        onClick={() => setIsResumeDialogOpen(true)}
                        className="group/resume text-sm sm:text-base font-medium hover:underline underline-offset-4 cursor-pointer text-left sm:text-right flex items-center justify-start sm:justify-end gap-1.5"
                      >
                        <span>View Resume</span>
                      </button>
                    ) : edit ? (
                      <button
                        onClick={() => openSidebar?.("footer")}
                        className="text-sm sm:text-base font-medium hover:underline underline-offset-4 cursor-pointer text-left sm:text-right"
                      >
                        Add Resume
                      </button>
                    ) : null}
                  </motion.div>
                )}

                {/* Email */}
                {(email || edit) && (
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-2.5 border-b border-border/10 group gap-1 sm:gap-4"
                    data-testid="footer-item-mail"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <span className="text-sm sm:text-base text-foreground-landing/50 dark:text-foreground-landing/60">Mail</span>
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="text-sm sm:text-base font-medium hover:underline underline-offset-4 break-all sm:break-normal text-left sm:text-right"
                      >
                        {email}
                      </a>
                    ) : edit ? (
                      <button
                        onClick={() => openSidebar?.("footer")}
                        className="text-sm sm:text-base font-medium hover:underline underline-offset-4 cursor-pointer text-left sm:text-right"
                      >
                        Add Email
                      </button>
                    ) : null}
                  </motion.div>
                )}

                {/* Phone */}
                {(phone || edit) && (
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-2.5 border-b border-border/10 group gap-1 sm:gap-4"
                    data-testid="footer-item-phone"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <span className="text-sm sm:text-base text-foreground-landing/50 dark:text-foreground-landing/60">Phone number</span>
                    {phone ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              className={`text-sm sm:text-base font-medium transition-all duration-300 min-w-0 sm:min-w-[180px] text-left sm:text-right flex items-center justify-start sm:justify-end gap-2 ${!isCopied ? 'hover:underline underline-offset-4 cursor-pointer' : 'cursor-default'}`}
                              onClick={handleCopyPhone}
                              data-testid="button-copy-phone"
                            >
                              {isCopied ? (
                                <motion.span
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center gap-2 text-[#FF553E]"
                                >
                                  Copied <ThumbsUp className="w-4 h-4" />
                                </motion.span>
                              ) : (
                                <span>{phone}</span>
                              )}
                            </button>
                          </TooltipTrigger>
                          {!isCopied && (
                            <TooltipContent className="bg-foreground-landing text-background border-none px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                              <p>Copy</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ) : edit ? (
                      <button
                        onClick={() => openSidebar?.("footer")}
                        className="text-sm sm:text-base font-medium hover:underline underline-offset-4 cursor-pointer text-left sm:text-right"
                      >
                        Add Phone
                      </button>
                    ) : null}
                  </motion.div>
                )}

                {/* Blogs/Medium */}
                {(portfolios?.medium || edit) && (
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-2.5 border-b border-border/10 group gap-1 sm:gap-4"
                    data-testid="footer-item-blogs"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <span className="text-sm sm:text-base text-foreground-landing/50 dark:text-foreground-landing/60">Blogs</span>
                    {portfolios?.medium ? (
                      <a 
                        href={portfolios.medium} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm sm:text-base font-medium hover:underline underline-offset-4 text-left sm:text-right"
                      >
                        Medium
                      </a>
                    ) : edit ? (
                      <button
                        onClick={() => openSidebar?.("footer")}
                        className="text-sm sm:text-base font-medium hover:underline underline-offset-4 cursor-pointer text-left sm:text-right"
                      >
                        Add Blog Link
                      </button>
                    ) : null}
                  </motion.div>
                )}

                {/* Socials */}
                {((socials?.linkedin || socials?.twitter || socials?.instagram || portfolios?.dribbble) || edit) && (
                  <motion.div
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-2.5 border-b border-border/10 group gap-1 sm:gap-4"
                    data-testid="footer-item-socials"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <span className="text-sm sm:text-base text-foreground-landing/50 dark:text-foreground-landing/60">Socials</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {socials?.linkedin ? (
                        <>
                          <a 
                            href={socials.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm sm:text-base font-medium hover:underline underline-offset-4"
                          >
                            LinkedIn
                          </a>
                          {(socials?.twitter || socials?.instagram || portfolios?.dribbble) && (
                            <span className="text-foreground-landing/20">•</span>
                          )}
                        </>
                      ) : null}
                      {socials?.twitter ? (
                        <>
                          <a 
                            href={socials.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm sm:text-base font-medium hover:underline underline-offset-4"
                          >
                            X
                          </a>
                          {(socials?.instagram || portfolios?.dribbble) && (
                            <span className="text-foreground-landing/20">•</span>
                          )}
                        </>
                      ) : null}
                      {socials?.instagram ? (
                        <>
                          <a 
                            href={socials.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm sm:text-base font-medium hover:underline underline-offset-4"
                          >
                            Instagram
                          </a>
                          {portfolios?.dribbble && (
                            <span className="text-foreground-landing/20">•</span>
                          )}
                        </>
                      ) : null}
                      {portfolios?.dribbble ? (
                        <a 
                          href={portfolios.dribbble} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm sm:text-base font-medium hover:underline underline-offset-4"
                        >
                          Dribbble
                        </a>
                      ) : null}
                      {edit && !socials?.linkedin && !socials?.twitter && !socials?.instagram && !portfolios?.dribbble && (
                        <button
                          onClick={() => openSidebar?.("footer")}
                          className="text-sm sm:text-base font-medium hover:underline underline-offset-4 cursor-pointer"
                        >
                          Add Socials
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="pt-6 flex flex-col items-center justify-center gap-4">
                {edit && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full h-11 w-11"
                    onClick={() => openSidebar?.("footer")}
                    data-testid="button-edit-footer"
                  >
                    <Pencil className="w-5 h-5" />
                  </Button>
                )}
                <svg
                  width="120"
                  height="40"
                  viewBox="0 0 120 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-foreground-landing/20 dark:text-foreground-landing/30"
                >
                  <motion.path
                    d="M10 20C17 13 23 27 30 20C37 13 43 27 50 20C57 13 63 27 70 20C77 13 83 27 90 20C97 13 103 27 110 20"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{
                      pathLength: { duration: 2, ease: "easeInOut" },
                      opacity: { duration: 0.3 }
                    }}
                  />
                </svg>
                <CrypticText 
                  text={`© ${getUserName()}`} 
                  className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground-landing/20 dark:text-foreground-landing/30" 
                />
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Resume PDF Dialog */}
      {resume?.url && (
        <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
          <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] p-0 overflow-hidden border-none bg-background shadow-2xl rounded-2xl">
            <div className="relative w-full h-full flex flex-col">
              <div className="absolute top-4 right-4 z-50">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-white dark:bg-df-section-card-bg-color"
                  onClick={() => setIsResumeDialogOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <iframe
                src={resume.url}
                className="w-full h-full border-0"
                title="Resume PDF"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
