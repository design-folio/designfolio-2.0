import { useState, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, Clapperboard } from "lucide-react";
import Lottie from "lottie-react";
import aiAssistantAnimation from "@/assets/AI-Assistant.json";
import {
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
} from "@/components/ui/kanban";
import { JobCard } from "./JobCard";
import { COL_LABELS } from "@/data/jobs";

export function PipelineCol({
  colId,
  jobs,
  onShortlist,
  onOpenJob,
  onDismiss,
  onMockInterview,
  onAskScout,
  onMoveTo,
  onDecide,
  colIndex = 0,
  onExhausted, // undefined = exhausted (hide button); function = show "Get More" button
  isRescanning = false,
  isListPhase = false,
  isCollapsed,
  collapsed,
  onToggleCollapse,
  joyrideActive = false,
}) {
  const isPicks = colId === "picks";
  const isInterview = colId === "interview";
  const isOffer = colId === "offer";
  const offerThreshold = isOffer && jobs.length >= 2;
  const [bannerReady, setBannerReady] = useState(false);

  useEffect(() => {
    if (!offerThreshold) {
      startTransition(() => setBannerReady(false));
      return;
    }
    const t = setTimeout(() => startTransition(() => setBannerReady(true)), 1200);
    return () => clearTimeout(t);
  }, [offerThreshold]);

  const cardList = (
    <AnimatePresence mode="popLayout" initial={false}>
      {jobs.map((job, idx) => (
        <motion.div
          key={job.id}
          layout
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            x: 64,
            scale: 0.93,
            transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
          }}
          transition={{
            layout: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
            duration: 0.28,
            ease: "easeOut",
          }}
        >
          <KanbanItem value={job.id} className="group/item rounded-lg">
            <KanbanItemHandle className="w-full cursor-grab active:cursor-grabbing">
              <JobCard
                job={job}
                onShortlist={isPicks ? () => onShortlist(job.id) : undefined}
                onOpen={() => onOpenJob(job.id)}
                onDismiss={onDismiss ? () => onDismiss(job.id) : undefined}
                onMockInterview={!isPicks ? () => onMockInterview(job.id) : undefined}
                onAskScout={() => onAskScout(job.id)}
                onMoveTo={
                  !isPicks && onMoveTo ? (targetColId) => onMoveTo(job.id, targetColId) : undefined
                }
                currentColId={colId}
                joyrideActive={isPicks && joyrideActive}
                joyrideFirst={isPicks && joyrideActive && idx === 0}
              />
            </KanbanItemHandle>
          </KanbanItem>
        </motion.div>
      ))}

      {/* Get More / Exhausted footer — picks column only */}
      {isPicks && jobs.length > 0 && (
        <motion.div
          key="fetch-more-footer"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-1 pb-2"
        >
          {!isRescanning && onExhausted && (
            <button
              onClick={onExhausted}
              className="dark:border-border text-foreground/50 hover:text-foreground hover:border-foreground/20 flex w-full items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] bg-transparent py-2.5 text-[12px] font-medium transition-colors"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Get more matches
            </button>
          )}
          {!isRescanning && !onExhausted && (
            <p className="text-muted-foreground/40 py-2 text-center text-[11px]">
              No more new roles found
            </p>
          )}
        </motion.div>
      )}

      {/* Rescanning / fetching-more indicator */}
      {isPicks && isRescanning && (
        <motion.div
          key="rescanning"
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center gap-2 py-3"
        >
          <div className="flex gap-[4px]">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[#FF553E]"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-muted-foreground/50 text-[11px]">Finding more roles…</span>
        </motion.div>
      )}

      {jobs.length === 0 && !isRescanning && !isPicks && (
        <div className="dark:border-border/50 mx-0.5 flex items-center justify-center rounded-lg border border-dashed border-black/10 py-10">
          <p className="text-muted-foreground/40 text-center text-[11px] leading-relaxed">
            Drag a role here
            <br />
            to track it
          </p>
        </div>
      )}

      {isPicks && jobs.length === 0 && !isRescanning && (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <p className="text-muted-foreground/40 text-[11px]">No roles found yet</p>
        </div>
      )}

      {jobs.length === 0 && isRescanning && (
        <div className="flex items-center justify-center py-10">
          <div className="flex gap-[4px]">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[#FF553E]"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  // ── Collapsible columns: picks (isCollapsed) and archived (collapsed) ──────
  const collapseActive = isPicks ? isCollapsed : collapsed;
  if (onToggleCollapse) {
    const morphEase = [0.22, 1, 0.36, 1];
    const morphDur = 0.42;
    const colBgCollapsible = "relative flex-1 rounded-xl bg-(--shell-bg) overflow-hidden h-full";
    return (
      <KanbanColumn value={colId} className={colBgCollapsible}>
        {/* Expanded state */}
        <motion.div
          className="absolute inset-0 flex flex-col"
          animate={{ opacity: collapseActive ? 0 : 1 }}
          transition={{ duration: morphDur, ease: morphEase }}
          style={{ pointerEvents: collapseActive ? "none" : "auto" }}
        >
          <div className="flex shrink-0 items-center gap-2 px-4 pt-4 pb-2 select-none">
            <span
              className="font-jetbrains-mono text-foreground text-[11px] font-semibold tracking-wider uppercase"
              style={{ opacity: 0.5 }}
            >
              {COL_LABELS[colId]}
            </span>
            {jobs.length > 0 && (
              <span className="text-foreground/40 rounded-full bg-black/[0.08] px-1.5 py-0.5 text-[10px] leading-none font-semibold dark:bg-white/[0.08]">
                {jobs.length}
              </span>
            )}
            {isPicks && isRescanning && (
              <span className="text-[10px] text-[#FF553E]/70">scanning…</span>
            )}
            {(!isPicks || !isListPhase) && (
              <button
                onClick={onToggleCollapse}
                className="ml-auto hidden h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-black/10 md:flex dark:hover:bg-white/10"
                title="Collapse"
              >
                <ChevronLeft className="text-foreground/40 h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <KanbanColumnContent
            value={colId}
            className="min-h-[60px] flex-1 overflow-y-auto px-3 pt-1 pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {cardList}
          </KanbanColumnContent>
        </motion.div>

        {/* Collapsed state (thin strip) */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center gap-2 py-3"
          animate={{ opacity: collapseActive ? 1 : 0 }}
          transition={{ duration: morphDur, ease: morphEase }}
          style={{ pointerEvents: collapseActive ? "auto" : "none" }}
        >
          <button
            onClick={onToggleCollapse}
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            title="Expand"
          >
            <ChevronRight className="text-foreground/50 h-3.5 w-3.5" />
          </button>
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
            <span
              className="font-jetbrains-mono text-foreground text-[11px] font-semibold tracking-wider uppercase select-none"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", opacity: 0.45 }}
            >
              {COL_LABELS[colId]}
            </span>
            {jobs.length > 0 && (
              <span
                className="font-jetbrains-mono text-foreground/40 rounded-full bg-black/[0.08] px-0.5 py-1.5 text-[10px] leading-none font-semibold select-none dark:bg-white/[0.08]"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {jobs.length}
              </span>
            )}
          </div>
        </motion.div>
      </KanbanColumn>
    );
  }

  const colBg = isPicks
    ? "flex flex-col min-w-[350px] flex-1 rounded-xl bg-[#E8E3DC] dark:bg-[#141414] overflow-hidden"
    : "flex flex-col min-w-[350px] flex-1 rounded-xl bg-[#E2DDD6] dark:bg-[#141414] overflow-hidden";

  return (
    <KanbanColumn value={colId} className={colBg}>
      <div className="flex shrink-0 items-center gap-2 px-4 pt-4 pb-2 select-none">
        <span
          className="font-jetbrains-mono text-foreground text-[11px] font-semibold tracking-wider uppercase"
          style={{ opacity: 0.5 }}
        >
          {COL_LABELS[colId]}
        </span>
        {jobs.length > 0 && (
          <span className="text-foreground/40 rounded-full bg-black/[0.08] px-1.5 py-0.5 text-[10px] leading-none font-semibold dark:bg-white/[0.08]">
            {jobs.length}
          </span>
        )}
        {isPicks && isRescanning && (
          <span className="ml-auto text-[10px] text-[#FF553E]/70">scanning…</span>
        )}
      </div>
      {bannerReady && !isPicks && (
        <AnimatePresence>
          <motion.div
            key="offer-banner"
            initial={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.97, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-2 mb-1.5 shrink-0"
          >
            <div className="dark:bg-card dark:border-border relative overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-sm">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-10"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(192,74,56,0.18) 0%, rgba(245,166,35,0.10) 40%, transparent 100%)",
                }}
              />
              <div className="px-3.5 pt-4 pb-3.5">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="h-[44px] w-[44px] shrink-0">
                    <Lottie animationData={aiAssistantAnimation} loop={true} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground/85 text-[14px] leading-tight font-semibold">
                      Two offers. Big decision.
                    </p>
                    <p className="text-foreground/45 mt-0.5 text-[12px] leading-snug font-normal">
                      Let Scout help you think it through.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onDecide}
                  className="bg-foreground text-background flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg text-[12px] font-medium transition-opacity hover:opacity-85"
                >
                  Help me decide
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      <KanbanColumnContent
        value={colId}
        className="min-h-[60px] flex-1 overflow-y-auto px-3 pt-1 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cardList}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}
