import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Clapperboard } from "lucide-react";
import Lottie from "lottie-react";
import aiAssistantAnimation from "@/assets/AI-Assistant.json";
import { KanbanColumn, KanbanColumnContent, KanbanItem, KanbanItemHandle } from "@/components/ui/kanban";
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
  onDecide,
  colIndex = 0,
  onExhausted,      // undefined = exhausted (hide button); function = show "Get More" button
  isRescanning = false,
  isListPhase = false,
  isCollapsed,
  collapsed,
  onToggleCollapse,
}) {
  const isPicks = colId === "picks";
  const isInterview = colId === "interview";
  const isOffer = colId === "offer";
  const offerThreshold = isOffer && jobs.length >= 2;
  const [bannerReady, setBannerReady] = useState(false);

  useEffect(() => {
    if (!offerThreshold) { setBannerReady(false); return; }
    const t = setTimeout(() => setBannerReady(true), 1200);
    return () => clearTimeout(t);
  }, [offerThreshold]);

  const cardList = (
    <AnimatePresence mode="popLayout" initial={false}>
      {jobs.map((job) => (
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
          <KanbanItem value={job.id} className="rounded-lg group/item">
            <KanbanItemHandle className="w-full cursor-grab active:cursor-grabbing">
              <JobCard
                job={job}
                onShortlist={isPicks ? () => onShortlist(job.id) : undefined}
                onOpen={() => onOpenJob(job.id)}
                onDismiss={onDismiss ? () => onDismiss(job.id) : undefined}
                onMockInterview={!isPicks ? () => onMockInterview(job.id) : undefined}
                onAskScout={() => onAskScout(job.id)}
              />
            </KanbanItemHandle>
          </KanbanItem>
        </motion.div>
      ))}

      {/* Get More / Exhausted footer — picks column only, hidden in initial list view */}
      {isPicks && !isListPhase && jobs.length > 0 && (
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
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-border text-[12px] font-medium text-foreground/50 hover:text-foreground hover:border-foreground/20 transition-colors bg-transparent"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Get more matches
            </button>
          )}
          {!isRescanning && !onExhausted && (
            <p className="text-center text-[11px] text-muted-foreground/40 py-2">
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
                className="w-1.5 h-1.5 rounded-full bg-[#FF553E]"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground/50">Finding more roles…</span>
        </motion.div>
      )}

      {jobs.length === 0 && !isRescanning && !isPicks && (
        <div className="flex items-center justify-center py-10 rounded-lg border border-dashed border-black/10 dark:border-border/50 mx-0.5">
          <p className="text-[11px] text-muted-foreground/40 text-center leading-relaxed">
            Drag a role here
            <br />
            to track it
          </p>
        </div>
      )}

      {isPicks && jobs.length === 0 && !isRescanning && (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <p className="text-[11px] text-muted-foreground/40">No roles found yet</p>
        </div>
      )}

      {jobs.length === 0 && isRescanning && (
        <div className="flex items-center justify-center py-10">
          <div className="flex gap-[4px]">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#FF553E]"
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
    const colBgCollapsible = isPicks
      ? "relative flex-1 rounded-xl bg-[#E8E3DC] dark:bg-[#141414] overflow-hidden h-full"
      : "relative flex-1 rounded-xl bg-[#E2DDD6] dark:bg-[#141414] overflow-hidden h-full";
    return (
      <KanbanColumn value={colId} className={colBgCollapsible}>
        {/* Expanded state */}
        <motion.div
          className="absolute inset-0 flex flex-col"
          animate={{ opacity: collapseActive ? 0 : 1 }}
          transition={{ duration: morphDur, ease: morphEase }}
          style={{ pointerEvents: collapseActive ? "none" : "auto" }}
        >
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 flex-shrink-0 select-none">
            <span
              className="font-jetbrains-mono text-[11px] font-semibold uppercase tracking-wider text-foreground"
              style={{ opacity: 0.5 }}
            >
              {COL_LABELS[colId]}
            </span>
            {jobs.length > 0 && (
              <span className="text-[10px] font-semibold text-foreground/40 bg-black/[0.08] dark:bg-white/[0.08] rounded-full px-1.5 py-0.5 leading-none">
                {jobs.length}
              </span>
            )}
            {isPicks && isRescanning && (
              <span className="text-[10px] text-[#FF553E]/70">scanning…</span>
            )}
            {(!isPicks || !isListPhase) && (
              <button
                onClick={onToggleCollapse}
                className="cursor-pointer ml-auto w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Collapse"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-foreground/40" />
              </button>
            )}
          </div>
          <KanbanColumnContent
            value={colId}
            className="flex-1 overflow-y-auto px-3 pt-1 pb-4 min-h-[60px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {cardList}
          </KanbanColumnContent>
        </motion.div>

        {/* Collapsed state (thin strip) */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center py-3 gap-2"
          animate={{ opacity: collapseActive ? 1 : 0 }}
          transition={{ duration: morphDur, ease: morphEase }}
          style={{ pointerEvents: collapseActive ? "auto" : "none" }}
        >
          <button
            onClick={onToggleCollapse}
            className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
            title="Expand"
          >
            <ChevronRight className="w-3.5 h-3.5 text-foreground/50" />
          </button>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
            <span
              className="font-jetbrains-mono text-[11px] font-semibold uppercase tracking-wider text-foreground select-none"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", opacity: 0.45 }}
            >
              {COL_LABELS[colId]}
            </span>
            {jobs.length > 0 && (
              <span
                className="font-jetbrains-mono text-[10px] font-semibold text-foreground/40 bg-black/[0.08] dark:bg-white/[0.08] rounded-full px-0.5 py-1.5 leading-none select-none"
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
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 flex-shrink-0 select-none">
        <span className="font-jetbrains-mono text-[11px] font-semibold uppercase tracking-wider text-foreground"
          style={{ opacity: 0.5 }}>{COL_LABELS[colId]}</span>
        {jobs.length > 0 && (
          <span className="text-[10px] font-semibold text-foreground/40 bg-black/[0.08] dark:bg-white/[0.08] rounded-full px-1.5 py-0.5 leading-none">
            {jobs.length}
          </span>
        )}
        {isPicks && isRescanning && (
          <span className="text-[10px] text-[#FF553E]/70 ml-auto">scanning…</span>
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
            className="mx-2 mb-1.5 flex-shrink-0"
          >
            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-card border border-black/[0.06] dark:border-border shadow-sm">
              <div
                className="absolute inset-x-0 top-0 h-10 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(192,74,56,0.18) 0%, rgba(245,166,35,0.10) 40%, transparent 100%)" }}
              />
              <div className="px-3.5 pt-4 pb-3.5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-[44px] h-[44px] flex-shrink-0">
                    <Lottie animationData={aiAssistantAnimation} loop={true} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-foreground/85 leading-tight">Two offers. Big decision.</p>
                    <p className="text-[12px] font-normal text-foreground/45 mt-0.5 leading-snug">Let Scout help you think it through.</p>
                  </div>
                </div>
                <button onClick={onDecide} className="w-full flex items-center justify-center gap-1.5 bg-foreground text-background text-[12px] font-medium h-8 rounded-lg hover:opacity-85 transition-opacity cursor-pointer">
                  Help me decide
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      <KanbanColumnContent
        value={colId}
        className="flex-1 overflow-y-auto px-3 pt-1 pb-4 min-h-[60px]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cardList}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}
