import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    target: "view-toggle",
    title: "Immersive or Editorial",
    description:
      "Switch your hero between a full-bleed cinematic view and a clean editorial layout. Each changes the whole feel of your case study.",
    prefer: "below",
    scrollBehavior: "instant",
  },
  {
    target: "add-section",
    title: "Build your story",
    description:
      "Add sections to structure your case study — rich text, image grids, side-by-side layouts, galleries, code embeds, and more.",
    prefer: "above",
    scrollBehavior: "smooth",
  },
];

const TOOLTIP_W = 288;
const TOOLTIP_H = 230; // estimate — only used to choose placement, never for pixel math
const PAD = 10;
const MOBILE_BP = 520;

function measureEl(target) {
  const el = document.querySelector(`[data-joyride="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    el,
    rect: {
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    },
  };
}

function tooltipPosition(rect, prefer, isMobile) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (isMobile) {
    const w = Math.min(TOOLTIP_W, vw - 32);
    return { bottom: 20, left: (vw - w) / 2, width: w, arrowDir: "none", arrowLeft: 0 };
  }

  const spaceAbove = rect.top;
  const spaceBelow = vh - (rect.top + rect.height);
  const need = TOOLTIP_H + 28;
  const fitsAbove = spaceAbove >= need;
  const fitsBelow = spaceBelow >= need;
  const side =
    prefer === "below"
      ? fitsBelow
        ? "below"
        : fitsAbove
          ? "above"
          : "pinned"
      : fitsAbove
        ? "above"
        : fitsBelow
          ? "below"
          : "pinned";

  const cx = rect.left + rect.width / 2;
  const left = Math.max(16, Math.min(cx - TOOLTIP_W / 2, vw - TOOLTIP_W - 16));
  const arrowLeft = Math.max(16, Math.min(cx - left - 8, TOOLTIP_W - 32));

  // "above" and "pinned" anchor the tooltip's BOTTOM edge, so the real rendered
  // height never matters and the tooltip can't be clipped by the viewport.
  // "pinned" handles large targets (e.g. the empty-state picker) where neither
  // side has room — the tooltip floats over the bottom of the spotlight.
  if (side === "below")
    return { top: rect.top + rect.height + 12, left, width: TOOLTIP_W, arrowDir: "top", arrowLeft };
  if (side === "above")
    return { bottom: vh - rect.top + 12, left, width: TOOLTIP_W, arrowDir: "bottom", arrowLeft };
  return { bottom: 20, left, width: TOOLTIP_W, arrowDir: "none", arrowLeft: 0 };
}

export function CaseStudyJoyride({ autoStart = false, onDone }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [tipPos, setTipPos] = useState(null);
  const [scrolling, setScrolling] = useState(false);
  // Whether a spotlight ever actually rendered — if the target elements never
  // appeared (slow load, layout without them), closing must NOT mark the tour
  // as seen, so it can retry on the next open.
  const shownRef = useRef(false);

  const recalc = useCallback((stepIdx) => {
    const result = measureEl(STEPS[stepIdx].target);
    if (!result) return;
    shownRef.current = true;
    setRect(result.rect);
    setTipPos(tooltipPosition(result.rect, STEPS[stepIdx].prefer, window.innerWidth < MOBILE_BP));
  }, []);

  const scrollAndFocus = useCallback(
    (stepIdx) => {
      const result = measureEl(STEPS[stepIdx].target);
      if (!result) return;
      const behavior = STEPS[stepIdx].scrollBehavior ?? "smooth";
      setScrolling(true);
      // scrollIntoView resolves the correct scroll container on its own
      // (FloatingPageContainer's inner overflow div, window, etc.)
      result.el.scrollIntoView({ behavior, block: "center" });
      setTimeout(
        () => {
          setScrolling(false);
          recalc(stepIdx);
        },
        behavior === "smooth" ? 620 : 80
      );
    },
    [recalc]
  );

  // Auto-start after DOM settles
  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => {
      setStep(0);
      setRect(null);
      setTipPos(null);
      setActive(true);
    }, 1000);
    return () => clearTimeout(t);
  }, [autoStart]);

  useEffect(() => {
    if (!active) return;
    // Deferred so the reset + scroll kick off after paint, once layout is stable
    const t = setTimeout(() => {
      setRect(null);
      setTipPos(null);
      scrollAndFocus(step);
    }, 0);
    return () => clearTimeout(t);
  }, [active, step, scrollAndFocus]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => recalc(step);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, step, recalc]);

  const close = useCallback(() => {
    setActive(false);
    onDone?.(shownRef.current);
  }, [onDone]);

  const next = () => (step < STEPS.length - 1 ? setStep((s) => s + 1) : close());
  const prev = () => step > 0 && setStep((s) => s - 1);
  const isLast = step === STEPS.length - 1;

  if (!active) return null;

  return createPortal(
    <AnimatePresence>
      {active && (
        <>
          {/* Click-away layer */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[210] cursor-default"
            onClick={close}
          />

          {/* Spotlight */}
          <AnimatePresence mode="wait">
            {rect && !scrolling && (
              <motion.div
                key={`spot-${step}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none fixed z-[211]"
                style={{
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                  borderRadius: rect.height < 80 ? 9999 : 12,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  border: "1.5px solid rgba(255,255,255,0.24)",
                  outline: "4px solid rgba(255,255,255,0.07)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Tooltip */}
          <AnimatePresence mode="wait">
            {tipPos && !scrolling && (
              <motion.div
                key={`tip-${step}`}
                initial={{
                  opacity: 0,
                  y: tipPos.arrowDir === "top" ? -10 : tipPos.arrowDir === "bottom" ? 10 : 12,
                  scale: 0.95,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto fixed z-[212]"
                style={{
                  top: tipPos.top,
                  bottom: tipPos.bottom,
                  left: tipPos.left,
                  width: tipPos.width,
                }}
              >
                {tipPos.arrowDir === "top" && (
                  <div
                    className="absolute -top-[6px] h-3 w-3 rotate-45 border-t border-l border-black/[0.07] bg-white dark:border-white/[0.1] dark:bg-[#1E1C1A]"
                    style={{ left: tipPos.arrowLeft, borderRadius: "2px 0 0 0" }}
                  />
                )}
                {tipPos.arrowDir === "bottom" && (
                  <div
                    className="absolute -bottom-[6px] h-3 w-3 rotate-45 border-r border-b border-black/[0.07] bg-white dark:border-white/[0.1] dark:bg-[#1E1C1A]"
                    style={{ left: tipPos.arrowLeft, borderRadius: "0 0 2px 0" }}
                  />
                )}

                <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-2xl dark:border-white/[0.09] dark:bg-[#1E1C1A]">
                  <div className="flex items-center gap-1.5 px-5 pt-4 pb-0">
                    {STEPS.map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          width: i === step ? 20 : 6,
                          background:
                            i === step
                              ? "#1A1A1A"
                              : i < step
                                ? "rgba(26,26,26,0.3)"
                                : "rgba(26,26,26,0.12)",
                        }}
                        transition={{ duration: 0.25 }}
                        className="h-[6px] rounded-full"
                        style={{ width: i === step ? 20 : 6 }}
                      />
                    ))}
                  </div>

                  <div className="px-5 pt-3.5 pb-5">
                    <h3 className="mb-1.5 text-[14.5px] leading-snug font-semibold tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0EDE7]">
                      {STEPS[step].title}
                    </h3>
                    <p className="mb-4 text-[12.5px] leading-[1.65] text-[#7A736C] dark:text-[#9E9893]">
                      {STEPS[step].description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#C4BDB6] tabular-nums select-none dark:text-[#5A554E]">
                        {step + 1} of {STEPS.length}
                      </span>
                      <div className="flex items-center gap-2">
                        {step > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              prev();
                            }}
                            className="h-[30px] gap-0.5 rounded-full border-black/10 px-3 text-[12px] font-medium text-[#7A736C] hover:border-black/20 hover:bg-transparent hover:text-[#1A1A1A] dark:border-white/10 dark:text-[#9E9893] dark:hover:border-white/20 dark:hover:text-[#F0EDE7]"
                          >
                            <ChevronLeft className="h-3 w-3" /> Back
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            next();
                          }}
                          className="h-[30px] gap-1 rounded-full bg-[#1A1A1A] px-4 text-[12px] font-semibold text-white hover:bg-[#2A2A2A] dark:bg-[#F0EDE7] dark:text-[#1A1A1A] dark:hover:bg-[#E5E2DC]"
                        >
                          {isLast ? (
                            "Done"
                          ) : (
                            <>
                              Next <ChevronRight className="h-3 w-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
