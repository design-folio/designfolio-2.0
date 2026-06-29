import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
} from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";
import ClaimDomain from "./claimDomain";
import Link from "next/link";
import Button from "./button";
import { Sun, Upload } from "lucide-react";
import { Typewriter } from "./ui/typewriter";
import { TextEffect } from "./ui/text-effect";
import { ResultPopup } from "./ResultPopup";
import AIThinkingBlock from "./ui/ai-thinking-block";
import { SegmentedControl } from "./ui/segmented-control";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { extractResumeText } from "@/lib/extractResumeText";
import axiosInstance from "@/network/axiosInstance";

const LANDING_ANALYZE_USED_KEY = "DESIGNFOLIO_LANDING_ANALYZE_USED";
const LAST_ANALYZE_RESULT_KEY = "DESIGNFOLIO_LAST_ANALYZE_RESULT";

export default function HeroSection({ dfToken, activeTab, setActiveTab, onResumeCompactChange }) {
  const sectionRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);
  const isMobile = useIsMobile();
  const lastWidthRef = useRef(0);

  const [internalTab, setInternalTab] = useState("scratch");
  const effectiveTab = activeTab ?? internalTab;
  const setEffectiveTab = setActiveTab ?? setInternalTab;
  const [isConverting, setIsConverting] = useState(false);
  const [resultContent, setResultContent] = useState(null);
  const [conversionError, setConversionError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzeUsed, setAnalyzeUsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LANDING_ANALYZE_USED_KEY) === "true";
  });

  const [leftCardOffset, setLeftCardOffset] = useState({ x: 0, y: 0 });
  const [rightCardOffset, setRightCardOffset] = useState({ x: 0, y: 0 });
  const [leftInitialScale, setLeftInitialScale] = useState(1);
  const [rightInitialScale, setRightInitialScale] = useState(1);
  const [leftCardWidth, setLeftCardWidth] = useState(null);
  const [rightCardWidth, setRightCardWidth] = useState(null);
  const [scrollRange, setScrollRange] = useState(800);

  const isResumeMode = effectiveTab === "resume";

  useEffect(() => {
    const compact = isResumeMode && analyzeUsed && !resultContent;
    onResumeCompactChange?.(compact);
  }, [isResumeMode, analyzeUsed, resultContent, onResumeCompactChange]);

  const processFile = async (file) => {
    if (analyzeUsed) return;
    setIsConverting(true);
    setConversionError(null);
    try {
      const text = await extractResumeText(file);
      if (!text || text.trim().length < 50) {
        throw new Error(
          "The file appears to be empty or too short. Please use a PDF or TXT file with at least 50 characters."
        );
      }
      const { data } = await axiosInstance.post("/ai/tools/resume/convert", { text: text.trim() });
      let content = data.content;
      // Attach resume PDF for prefill (FooterSettingsPanel format)
      if (file?.type === "application/pdf" && file?.size <= 5 * 1024 * 1024) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
        content = {
          ...content,
          resumeFile: {
            key: base64,
            originalName: file.name,
            extension: file.type?.split("/")[1] || "pdf",
          },
        };
      }
      setResultContent(content);
      if (typeof window !== "undefined") {
        localStorage.setItem(LANDING_ANALYZE_USED_KEY, "true");
        try {
          localStorage.setItem(LAST_ANALYZE_RESULT_KEY, JSON.stringify(content));
        } catch (_) {}
      }
      setAnalyzeUsed(true);
    } catch (err) {
      console.error("Error converting resume:", err);
      setConversionError(err.message || "Failed to convert resume. Please try a different file.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isConverting && !analyzeUsed) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isConverting || analyzeUsed) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validExt = [".pdf", ".txt"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (validExt.includes(ext) || file.type === "application/pdf" || file.type === "text/plain") {
        processFile(file);
      } else {
        setConversionError("Invalid file type. Please upload a PDF or TXT file.");
      }
    }
  };

  useEffect(() => {
    const updateCardPositions = (force = false) => {
      const currentWidth = window.innerWidth;

      // Only skip recalculation if width unchanged AND not forced
      // This allows recalculation when layout shifts due to fonts/height changes
      if (
        !force &&
        lastWidthRef.current !== 0 &&
        Math.abs(currentWidth - lastWidthRef.current) < 1
      ) {
        return;
      }

      lastWidthRef.current = currentWidth;

      const portfolioCard1 = document.getElementById("portfolio-card-1");
      const portfolioCard2 = document.getElementById("portfolio-card-2");

      let maxDeltaY = 0;

      // Desired hero widths (responsive based on breakpoint)
      const getDesiredHeroWidth = () => {
        if (currentWidth >= 1536) return 256; // 2xl:w-64
        if (currentWidth >= 1280) return 224; // xl:w-56
        if (currentWidth >= 1024) return 192; // lg:w-48
        if (currentWidth >= 768) return 144; // md:w-36
        if (currentWidth >= 640) return 128; // sm:w-32
        return 112; // w-28
      };

      if (portfolioCard1 && leftCardRef.current) {
        // Get portfolio card dimensions
        const portfolio1Rect = portfolioCard1.getBoundingClientRect();

        // Set card to match portfolio width
        setLeftCardWidth(portfolio1Rect.width);

        // Calculate initial scale (how small the card should appear in hero)
        const desiredHeroWidth = getDesiredHeroWidth();
        const initialScale = desiredHeroWidth / portfolio1Rect.width;
        setLeftInitialScale(initialScale);

        // Temporarily disable transforms to get accurate position
        const leftElement = leftCardRef.current;
        const prevTransform = leftElement.style.transform;
        leftElement.style.transform = "none";

        const leftRect = leftElement.getBoundingClientRect();

        // Calculate center positions
        const leftCenterX = leftRect.left + leftRect.width / 2;
        const leftCenterY = leftRect.top + window.scrollY + leftRect.height / 2;
        const portfolio1CenterX = portfolio1Rect.left + portfolio1Rect.width / 2;
        const portfolio1CenterY = portfolio1Rect.top + window.scrollY + portfolio1Rect.height / 2;

        // Calculate offset from center to center
        const deltaX = portfolio1CenterX - leftCenterX;
        const deltaY = portfolio1CenterY - leftCenterY;

        setLeftCardOffset({ x: deltaX, y: deltaY });
        maxDeltaY = Math.max(maxDeltaY, Math.abs(deltaY));

        // Restore transform
        leftElement.style.transform = prevTransform;
      }

      if (portfolioCard2 && rightCardRef.current) {
        // Get portfolio card dimensions
        const portfolio2Rect = portfolioCard2.getBoundingClientRect();

        // Set card to match portfolio width
        setRightCardWidth(portfolio2Rect.width);

        // Calculate initial scale (how small the card should appear in hero)
        const desiredHeroWidth = getDesiredHeroWidth();
        const initialScale = desiredHeroWidth / portfolio2Rect.width;
        setRightInitialScale(initialScale);

        // Temporarily disable transforms to get accurate position
        const rightElement = rightCardRef.current;
        const prevTransform = rightElement.style.transform;
        rightElement.style.transform = "none";

        const rightRect = rightElement.getBoundingClientRect();

        // Calculate center positions
        const rightCenterX = rightRect.left + rightRect.width / 2;
        const rightCenterY = rightRect.top + window.scrollY + rightRect.height / 2;
        const portfolio2CenterX = portfolio2Rect.left + portfolio2Rect.width / 2;
        const portfolio2CenterY = portfolio2Rect.top + window.scrollY + portfolio2Rect.height / 2;

        // Calculate offset from center to center
        const deltaX = portfolio2CenterX - rightCenterX;
        const deltaY = portfolio2CenterY - rightCenterY;

        setRightCardOffset({ x: deltaX, y: deltaY });
        maxDeltaY = Math.max(maxDeltaY, Math.abs(deltaY));

        // Restore transform
        rightElement.style.transform = prevTransform;
      }

      // Set scroll range based on the maximum distance either card needs to travel
      // Use a much smaller multiplier on mobile for faster animation (less scroll needed)
      const multiplier = isMobile ? 0.15 : 0.6;
      const calculatedScrollRange = Math.max(maxDeltaY * multiplier, 200);
      setScrollRange(calculatedScrollRange);
    };

    // Initial calculation
    updateCardPositions();

    // Wait for fonts to load, then recalculate after layout settles
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateCardPositions(true);
        });
      });
    });

    // Fallback timeout for browsers that don't support fonts API
    const timeoutId = setTimeout(() => updateCardPositions(true), 300);

    const handleResize = () => updateCardPositions();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  const { scrollY } = useScroll();

  // Cloud parallax transforms (Resume tab sky background)
  const cloud1Y = useTransform(scrollY, [0, 500], [0, 120]);
  const cloud2Y = useTransform(scrollY, [0, 500], [0, -40]);
  const cloud3Y = useTransform(scrollY, [0, 500], [0, 160]);
  const cloud4Y = useTransform(scrollY, [0, 500], [0, 60]);

  // Spring configuration - more responsive on mobile for better performance
  const springConfig = isMobile
    ? { stiffness: 230, damping: 45, mass: 0.1 }
    : { stiffness: 100, damping: 30, mass: 1 };

  const leftCardTranslateYRaw = useTransform(scrollY, [0, scrollRange], [0, leftCardOffset.y], {
    clamp: true,
  });
  const leftCardTranslateY = useSpring(leftCardTranslateYRaw, springConfig);

  const leftCardTranslateXRaw = useTransform(scrollY, [0, scrollRange], [0, leftCardOffset.x], {
    clamp: true,
  });
  const leftCardTranslateX = useSpring(leftCardTranslateXRaw, springConfig);

  const rightCardTranslateYRaw = useTransform(scrollY, [0, scrollRange], [0, rightCardOffset.y], {
    clamp: true,
  });
  const rightCardTranslateY = useSpring(rightCardTranslateYRaw, springConfig);

  const rightCardTranslateXRaw = useTransform(scrollY, [0, scrollRange], [0, rightCardOffset.x], {
    clamp: true,
  });
  const rightCardTranslateX = useSpring(rightCardTranslateXRaw, springConfig);

  // Add rotation on all devices for visual interest
  const leftCardRotateRaw = useTransform(scrollY, [0, scrollRange], isMobile ? [-8, 0] : [-6, 0], {
    clamp: true,
  });
  const leftCardRotate = useSpring(leftCardRotateRaw, springConfig);

  const rightCardRotateRaw = useTransform(scrollY, [0, scrollRange], isMobile ? [8, 0] : [6, 0], {
    clamp: true,
  });
  const rightCardRotate = useSpring(rightCardRotateRaw, springConfig);

  const leftScaleRaw = useTransform(scrollY, [0, scrollRange], [leftInitialScale, 1], {
    clamp: true,
  });
  const leftScale = useSpring(leftScaleRaw, springConfig);

  const rightScaleRaw = useTransform(scrollY, [0, scrollRange], [rightInitialScale, 1], {
    clamp: true,
  });
  const rightScale = useSpring(rightScaleRaw, springConfig);

  // Fade out shadow as cards reach profile section
  const shadowOpacityRaw = useTransform(scrollY, [0, scrollRange], [1, 0], {
    clamp: true,
  });
  const shadowOpacity = useSpring(shadowOpacityRaw, springConfig);

  const cardBoxShadow = useMotionTemplate`0 10px 15px -3px rgba(0, 0, 0, ${useTransform(
    shadowOpacity,
    (v) => v * 0.1
  )}), 0 4px 6px -4px rgba(0, 0, 0, ${useTransform(shadowOpacity, (v) => v * 0.1)})`;

  return (
    <section ref={sectionRef} className="relative overflow-visible px-6 py-8 sm:py-12 md:py-16">
      <AnimatePresence mode="wait">
        {isResumeMode ? (
          <motion.div
            key="sky-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-16 right-0 left-0 z-0 h-[600px] sm:-top-20 sm:h-[700px]"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #7DD3FC 0%, #BAE6FD 20%, #E0F2FE 45%, #F0F9FF 70%, hsl(var(--background-landing)) 100%)",
              }}
            />
            <motion.img
              src="/cloud.avif"
              alt=""
              className="absolute top-20 left-0 z-[1] w-48 opacity-90 sm:w-64"
              style={{ transform: "scaleX(-1)", y: cloud1Y }}
            />
            <motion.img
              src="/cloud.avif"
              alt=""
              className="absolute top-28 right-0 z-[1] w-56 opacity-90 sm:w-72"
              style={{ y: cloud2Y }}
            />
            <motion.img
              src="/cloud.avif"
              alt=""
              className="absolute bottom-0 left-[10%] z-[1] w-40 opacity-80 sm:w-52"
              style={{ y: cloud3Y }}
            />
            <motion.img
              src="/cloud.avif"
              alt=""
              className="absolute right-[15%] bottom-10 z-[1] w-36 opacity-70 sm:w-48"
              style={{ transform: "scaleX(-1)", y: cloud4Y }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 left-0 z-0"
            style={{
              top: "40%",
              bottom: "-120%",
              backgroundImage: `
            radial-gradient(ellipse 80% 60% at center, transparent 20%, hsl(var(--background-landing)) 70%),
            linear-gradient(to right, hsl(var(--foreground-landing) / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground-landing) / 0.08) 1px, transparent 1px)
          `,
              backgroundSize: "cover, 80px 80px, 80px 80px",
            }}
          />
        )}
      </AnimatePresence>

      {!isResumeMode && (
        <>
          <motion.div
            ref={leftCardRef}
            className="absolute -top-12 -left-40 z-[31] will-change-transform lg:top-20 lg:-left-8 xl:top-28 xl:left-4 2xl:left-16"
            style={{
              width: leftCardWidth ? `${leftCardWidth}px` : undefined,
              y: leftCardTranslateY,
              x: leftCardTranslateX,
              z: 0,
              rotate: leftCardRotate,
              scale: leftScale,
              transformOrigin: "center",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            <motion.div
              className="dark:bg-card border-border flex flex-col overflow-hidden rounded-lg border bg-white md:rounded-xl lg:rounded-2xl"
              style={{
                boxShadow: cardBoxShadow,
              }}
              data-testid="card-project-left"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src="/assets/svgs/casestudyux1.svg"
                  alt="Fitness app redesign case study"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-4 md:p-5">
                <h3
                  className="font-gsans text-foreground mb-1 line-clamp-2 min-h-[2.5rem] text-base font-semibold md:min-h-[3rem] md:text-lg lg:text-xl"
                  data-testid="text-project-left-title"
                >
                  Redesigning fitness app experience for 4M users.
                </h3>
                <p
                  className="text-df-description-color text-xs md:text-sm"
                  data-testid="text-project-left-category"
                >
                  AI Fitness Tracker
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            ref={rightCardRef}
            className="absolute -right-32 -bottom-20 z-[29] will-change-transform lg:top-32 lg:-right-8 lg:bottom-auto xl:top-40 xl:right-4 2xl:right-16"
            style={{
              width: rightCardWidth ? `${rightCardWidth}px` : undefined,
              y: rightCardTranslateY,
              x: rightCardTranslateX,
              z: 0,
              rotate: rightCardRotate,
              scale: rightScale,
              transformOrigin: "center",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            <motion.div
              className="dark:bg-card border-border flex flex-col overflow-hidden rounded-lg border bg-white md:rounded-xl lg:rounded-2xl"
              style={{
                boxShadow: cardBoxShadow,
              }}
              data-testid="card-project-right"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src="/assets/svgs/casestudyux2.svg"
                  alt="Blockchain crypto app case study"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-4 md:p-5">
                <h3
                  className="font-gsans text-foreground mb-1 line-clamp-2 min-h-[2.5rem] text-base font-semibold md:min-h-[3rem] md:text-lg lg:text-xl"
                  data-testid="text-project-right-title"
                >
                  Built a blockchain crypto app using Next.js
                </h3>
                <p
                  className="text-df-description-color text-xs md:text-sm"
                  data-testid="text-project-right-category"
                >
                  Launched on Product Hunt
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}

      <div className="relative z-50 mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 md:px-12 lg:px-0">
          <motion.div
            className="mb-8 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <SegmentedControl
              layoutId="segmented-control-hero"
              options={["From Scratch", "Use Resume"]}
              value={effectiveTab === "scratch" ? "From Scratch" : "Use Resume"}
              onChange={(val) => {
                setConversionError(null);
                setEffectiveTab(val === "From Scratch" ? "scratch" : "resume");
              }}
            />
          </motion.div>

          <div
            className={cn(
              "relative w-full",
              isResumeMode && !analyzeUsed ? "min-h-[550px]" : "min-h-[350px]"
            )}
          >
            <AnimatePresence mode="sync">
              {isResumeMode ? (
                <motion.div
                  key="resume-content"
                  className="absolute inset-0 w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <TextEffect
                    as="h1"
                    preset="blur"
                    per="word"
                    className="font-gsans text-foreground-landing mx-auto mb-4 max-w-3xl text-3xl leading-tight font-semibold sm:mb-6 sm:text-5xl md:text-5xl lg:text-6xl xl:text-6xl"
                    data-testid="text-resume-headline"
                    delay={0.1}
                  >
                    Turn your resume into a personal website
                  </TextEffect>
                  <motion.p
                    className="mx-auto mb-6 max-w-3xl text-sm leading-relaxed text-[rgb(125,125,125)] sm:mb-8 sm:text-base md:text-lg lg:text-xl"
                    data-testid="text-resume-description"
                  >
                    Skip the busywork with Designfolio — publish in hours, not weeks.
                  </motion.p>

                  {analyzeUsed && !resultContent ? (
                    <div className="bg-foreground-landing/5 border-foreground-landing/10 mx-auto max-w-xl rounded-2xl border p-6">
                      <p className="text-foreground-landing/80 text-sm">
                        You&apos;ve already used Analyze once on this visit.{" "}
                        <button
                          type="button"
                          className="text-df-orange-color font-medium hover:underline"
                          onClick={() => {
                            try {
                              const raw =
                                typeof window !== "undefined" &&
                                localStorage.getItem(LAST_ANALYZE_RESULT_KEY);
                              if (raw) setResultContent(JSON.parse(raw));
                            } catch (_) {}
                          }}
                        >
                          Continue to sign up
                        </button>{" "}
                        to use your generated portfolio.
                      </p>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "group relative z-10 mx-auto max-w-xl rounded-[1.25rem] bg-gradient-to-b p-[1px] shadow-lg transition-all duration-300 sm:rounded-[1.5rem]",
                        isDragging
                          ? "scale-[1.01] from-[#FF553E]/60 via-[#FF553E]/20 to-[#FF553E]/60 ring-8 ring-[#FF553E]/5"
                          : "from-border/60 via-border/30 to-border/60"
                      )}
                      data-testid="card-resume-upload"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div
                        className={cn(
                          "overflow-hidden rounded-[1.125rem] bg-white transition-colors duration-300 sm:rounded-[1.375rem] dark:bg-[#1a1a1a]",
                          isDragging && "bg-[#FF553E]/[0.01] dark:bg-[#FF553E]/[0.01]"
                        )}
                      >
                        <div className="border-border/50 flex items-center gap-2 border-b bg-[#f6f6f6] px-4 py-2.5 dark:bg-[#252525]">
                          <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
                            <div className="h-2.5 w-2.5 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
                            <div className="h-2.5 w-2.5 rounded-full border border-[#1aab29] bg-[#27c93f]" />
                          </div>
                          <div className="flex flex-1 justify-center">
                            <div className="text-foreground/40 border-border/40 min-w-[140px] truncate rounded-md border bg-white px-3 py-1 text-center text-[10px] dark:bg-[#2a2a2a]">
                              yourname.designfolio.me
                            </div>
                          </div>
                          <div className="w-10" />
                        </div>
                        <div className="flex flex-col items-center gap-5 p-8 sm:p-10">
                          {isConverting ? (
                            <AIThinkingBlock />
                          ) : (
                            <>
                              <div
                                className={cn(
                                  "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300",
                                  isDragging
                                    ? "scale-110 bg-[#FF553E] text-white shadow-lg shadow-[#FF553E]/30"
                                    : "bg-[#FF553E]/10 text-[#FF553E]"
                                )}
                              >
                                <Upload className="h-7 w-7" />
                              </div>
                              {conversionError ? (
                                <div className="bg-destructive/10 border-destructive/20 w-full max-w-md rounded-lg border px-4 py-2">
                                  <p className="text-destructive text-sm font-medium">
                                    {conversionError}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-1.5 text-center">
                                  <p className="text-foreground text-lg font-semibold sm:text-xl">
                                    {isDragging
                                      ? "Drop your resume here"
                                      : "Click to upload or drag and drop"}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    PDF or TXT (max. 10MB)
                                  </p>
                                </div>
                              )}
                              <div className="mx-auto w-full max-w-xs pt-2">
                                <Input
                                  type="file"
                                  className="hidden"
                                  id="resume-upload"
                                  accept=".pdf,.txt"
                                  data-testid="input-resume-file"
                                  onChange={handleFileUpload}
                                  disabled={isConverting || analyzeUsed}
                                />
                                <label
                                  htmlFor={analyzeUsed ? undefined : "resume-upload"}
                                  className={cn(
                                    "flex h-12 w-full items-center justify-center gap-2 rounded-full border-none text-base font-semibold text-white transition-transform active:scale-[0.98]",
                                    analyzeUsed
                                      ? "bg-foreground-landing/50 pointer-events-none cursor-not-allowed"
                                      : "cursor-pointer bg-[#FF553E] hover:bg-[#E64935]"
                                  )}
                                >
                                  {analyzeUsed ? "Already used" : "Select Resume"}
                                </label>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {resultContent && (
                    <ResultPopup content={resultContent} onClose={() => setResultContent(null)} />
                  )}
                  <p className="text-muted-foreground mt-8 text-base">
                    By uploading, you agree to our{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="hover:text-foreground underline transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="domain-content"
                  className="absolute inset-0 w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="mb-4 flex items-center justify-center gap-2"
                    >
                      <Sun className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <p className="text-foreground-landing/60 text-xs font-medium tracking-wider uppercase sm:text-sm">
                        Built for{" "}
                        <Typewriter
                          text={["Product Designers", "Product Managers", "DEVs"]}
                          speed={40}
                          className="text-foreground-landing font-semibold"
                          waitTime={1000}
                          deleteSpeed={25}
                          loop={true}
                          cursorChar={"_"}
                        />
                      </p>
                    </motion.div>
                    <TextEffect
                      as="h1"
                      preset="blur"
                      per="word"
                      className="font-eudoxus text-foreground-landing mb-4 text-2xl leading-[1.1] font-bold min-[420px]:text-3xl sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl"
                      data-testid="text-hero-headline"
                      delay={0.1}
                    >
                      Building a portfolio was never meant to be hard.
                    </TextEffect>
                  </motion.div>
                  <motion.p
                    className="mx-auto mb-6 max-w-3xl leading-relaxed text-[rgb(125,125,125)] sm:mb-8 sm:text-base md:text-[1rem]"
                    data-testid="text-hero-description"
                    initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Skip the busywork with Designfolio — publish in hours, not weeks.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {dfToken ? (
                      <Link href="builder" className="mt-6 flex items-center justify-center">
                        <Button
                          text="Launch Builder"
                          customClass="bg-foreground-landing text-background-landing border border-foreground rounded-full py-2 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base font-medium hover:bg-foreground-landing/80 transition-colors"
                          icon={
                            <img
                              src="/assets/svgs/power.svg"
                              alt="launch builder"
                              className="cursor-pointer"
                            />
                          }
                        />
                      </Link>
                    ) : (
                      <ClaimDomain form="header" />
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
