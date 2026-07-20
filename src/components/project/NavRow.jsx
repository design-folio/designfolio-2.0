import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PublishDropdown } from "@/components/loggedInHeader/publish-dropdown";
import LockPopover from "./LockPopover";
import ViewToggle from "./ViewToggle";

export default function NavRow({
  dark,
  mode,
  heroView,
  setHeroView,
  onBack,
  onWorkClick,
  resumeUrl,
  onAnalyze,
  project,
  analyzeStatus,
  analyzeButtonLabel,
  analyzeTooltipMessage,
  isAnalyzeDisabled,
  containerClass,
  isRetroOS,
}) {
  const isEditor = mode === "editor";
  const [openPopover, setOpenPopover] = useState(null);
  const textClass = dark
    ? "text-white/80 hover:text-white"
    : "text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]";

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navRef = useRef(null);
  useEffect(() => {
    const getScrollContainer = () => {
      const root = navRef.current?.closest("[data-scroll-root]");
      if (root) {
        const { overflowY } = window.getComputedStyle(root);
        if (/(auto|scroll)/.test(overflowY)) return root;
      }
      return window;
    };
    const scrollEl = getScrollContainer();
    const isWindowScroll = scrollEl === window;
    const handleScroll = () => {
      const currentY = isWindowScroll ? window.scrollY : scrollEl.scrollTop;
      setIsVisible(currentY < lastScrollY.current || currentY <= 150);
      lastScrollY.current = currentY;
    };
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);
  const hideStyle = { transform: isVisible ? "translateY(0)" : "translateY(-120%)" };

  // Editorial only: `fixed` takes the bar out of flow, so the title below it
  // needs the reserved space back. Measured (not hardcoded) since the row's
  // height differs between editor/preview/public.
  const barRef = useRef(null);
  const [barHeight, setBarHeight] = useState(64);
  useEffect(() => {
    if (dark || isRetroOS || !barRef.current) return;
    const el = barRef.current;
    const observer = new ResizeObserver(([entry]) => setBarHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, [dark, isRetroOS]);

  const row = (
    // Contained to the title's width so the nav's left/right edges align with
    // the content in each view (editorial 880, immersive 1100). Buttons are
    // split by mode — Work/Resume in public+preview, editor controls in the
    // editor — so neither row gets crowded.
    <div className={cn("mx-auto flex w-full items-center justify-between gap-3", containerClass)}>
      {/* Back */}
      <button
        onClick={onBack}
        className={cn(
          "group flex cursor-pointer items-center gap-1.5 text-[13px] font-medium transition-colors",
          textClass
        )}
      >
        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {"Go Back"}
      </button>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Work + Resume — public / preview only (keeps the editor row roomy) */}
        {!isEditor && (
          <div className={cn("flex items-center gap-4 text-[13px] font-medium", textClass)}>
            <button onClick={onWorkClick} className="cursor-pointer transition-colors">
              Work
            </button>
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-1 transition-colors"
              >
                <span className="text-[10px]">✦</span> Resume
              </a>
            )}
          </div>
        )}

        {/* Editor-only: Lock + Analyze */}
        {isEditor && (
          <div className="flex items-center gap-1.5">
            <LockPopover
              project={project}
              dark={dark}
              open={openPopover === "lock"}
              onOpenChange={(o) => setOpenPopover(o ? "lock" : null)}
            />
            {analyzeStatus && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "inline-flex",
                        isAnalyzeDisabled ? "cursor-not-allowed" : "cursor-pointer"
                      )}
                    >
                      <button
                        onClick={onAnalyze}
                        disabled={isAnalyzeDisabled}
                        className={cn(
                          "group flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-all",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          dark
                            ? "border-white/10 bg-white/10 text-white/80 hover:bg-white/20"
                            : "border-black/10 bg-white/50 text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#2A2520]/50 dark:text-[#F0EDE7] dark:hover:bg-white/5"
                        )}
                      >
                        <Sparkles size={15} strokeWidth={2} className="shrink-0" />
                        <span className="hidden sm:inline">{analyzeButtonLabel}</span>
                      </button>
                    </span>
                  </TooltipTrigger>
                  {analyzeTooltipMessage && (
                    <TooltipContent
                      side="bottom"
                      className="bg-foreground text-background rounded px-2 py-1 text-xs"
                    >
                      {analyzeTooltipMessage}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* View toggle — editor only */}
        {isEditor && setHeroView && (
          <div data-joyride="view-toggle">
            <ViewToggle heroView={heroView} setHeroView={setHeroView} dark={dark} />
          </div>
        )}
        {isEditor && (
          <PublishDropdown
            open={openPopover === "publish"}
            onOpenChange={(o) => setOpenPopover(o ? "publish" : null)}
          />
        )}
      </div>
    </div>
  );

  // Retro OS windowed template: it scrolls inside its own container rather
  // than the window, so `fixed` would break out of the simulated window
  // shell — keep each view's original in-flow positioning untouched.
  if (isRetroOS) {
    return dark ? (
      <div className="pointer-events-none relative z-20 flex justify-center pt-7">
        <div className="pointer-events-auto w-full" onClick={(e) => e.stopPropagation()}>
          {row}
        </div>
      </div>
    ) : (
      <div className="sticky top-0 z-50 flex justify-center border-b border-black/5 bg-white/90 backdrop-blur-md dark:border-white/5 dark:bg-[#1A1A1A]/90">
        <div className="w-full py-4">{row}</div>
      </div>
    );
  }

  // Immersive: fully transparent, pointer-events split so clicks pass
  // through to the hero underneath except on the nav content itself.
  if (dark) {
    return (
      <div
        ref={navRef}
        className="pointer-events-none fixed top-0 right-0 left-0 z-50 flex justify-center pt-7 transition-transform duration-300 ease-out"
        style={hideStyle}
      >
        <div className="pointer-events-auto w-full" onClick={(e) => e.stopPropagation()}>
          {row}
        </div>
      </div>
    );
  }

  // Editorial: `fixed` (not `sticky`) so it stays pinned across every
  // section of the page, not just while scrolling within EditorialHero's
  // own container.
  return (
    <>
      <div style={{ height: barHeight }} aria-hidden="true" />
      <div
        ref={(el) => {
          barRef.current = el;
          navRef.current = el;
        }}
        className="fixed top-0 right-0 left-0 z-50 flex justify-center border-b border-black/5 bg-white/90 backdrop-blur-md transition-transform duration-300 ease-out dark:border-white/5 dark:bg-[#1A1A1A]/90"
        style={hideStyle}
      >
        <div className="w-full py-4">{row}</div>
      </div>
    </>
  );
}
