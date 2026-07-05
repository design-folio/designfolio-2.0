import { ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
}) {
  const isEditor = mode === "editor";
  const textClass = dark
    ? "text-white/80 hover:text-white"
    : "text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7]";

  return (
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
            <LockPopover project={project} dark={dark} />
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
          <ViewToggle heroView={heroView} setHeroView={setHeroView} dark={dark} />
        )}
      </div>
    </div>
  );
}
