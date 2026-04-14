import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  colIndex = 0,
  onExhausted,
  isRescanning = false,
}) {
  const isPicks    = colId === "picks";
  const isInterview = colId === "interview";

  const sentinelRef     = useRef(null);
  const onExhaustedRef  = useRef(onExhausted);
  const isRescanningRef = useRef(isRescanning);
  const jobsLengthRef   = useRef(jobs.length);
  const [sentinelVisible, setSentinelVisible] = useState(false);

  // Keep refs in sync each render — no observer rebuild needed for these changes.
  useEffect(() => { onExhaustedRef.current  = onExhausted;  });
  useEffect(() => { isRescanningRef.current = isRescanning; });
  useEffect(() => { jobsLengthRef.current   = jobs.length;  });

  // Root must be the column's scroll container — not viewport — otherwise the sentinel
  // stays clipped inside the column and the observer never fires.
  // Observer is set up once on mount so it isn't torn down on every isRescanning flip.
  useEffect(() => {
    if (!isPicks || !sentinelRef.current) return;
    const scrollContainer = sentinelRef.current.closest('[data-slot="kanban-column-content"]');
    console.log("[sentinel] root element:", scrollContainer, "parentElement was:", sentinelRef.current.parentElement);
    const obs = new IntersectionObserver(
      ([entry]) => {
        setSentinelVisible(entry.isIntersecting);
        if (entry.isIntersecting && jobsLengthRef.current > 0 && !isRescanningRef.current) {
          onExhaustedRef.current?.();
        }
      },
      { root: scrollContainer, threshold: 0.1 },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPicks]); // intentionally stable — dynamic values read via refs

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
          <KanbanItem value={job.id} className="rounded-lg">
            <KanbanItemHandle className="w-full rounded-lg">
              <JobCard
                job={job}
                onShortlist={isPicks ? () => onShortlist(job.id) : undefined}
                onOpen={() => onOpenJob(job.id)}
                onDismiss={onDismiss ? () => onDismiss(job.id) : undefined}
                onMockInterview={isInterview ? () => onMockInterview(job.id) : undefined}
                onAskScout={() => onAskScout(job.id)}
              />
            </KanbanItemHandle>
          </KanbanItem>
        </motion.div>
      ))}

      {isPicks && (
        <div
          key="sentinel"
          ref={sentinelRef}
          className={`h-6 mx-1 rounded flex items-center justify-center text-[10px] font-mono transition-colors ${
            sentinelVisible
              ? "bg-emerald-400/30 text-emerald-700 dark:text-emerald-300"
              : "bg-orange-300/30 text-orange-600 dark:text-orange-400"
          }`}
        >
          sentinel · {sentinelVisible ? "IN VIEW → fetch triggered" : "out of view"}
        </div>
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

      {jobs.length === 0 && !isRescanning && (
        <div className="flex items-center justify-center py-10 rounded-lg border border-dashed border-black/10 dark:border-border/50 mx-0.5">
          <p className="text-[11px] text-muted-foreground/40 text-center leading-relaxed">
            Drag a role here
            <br />
            to track it
          </p>
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

  const colBg = isPicks
    ? "flex flex-col min-w-[350px] flex-1 rounded-xl bg-[#EAE6DF] dark:bg-card border border-[#DDD8D0] dark:border-border overflow-hidden"
    : "flex flex-col min-w-[350px] flex-1 rounded-xl bg-[#E8E4DD] dark:bg-card border border-[#DDD8D0] dark:border-border overflow-hidden";

  return (
    <KanbanColumn value={colId} className={colBg}>
      <div className="flex items-center gap-2 px-3 pt-3 pb-1 flex-shrink-0 select-none">
        <span className="text-[13px] font-semibold text-foreground/80">{COL_LABELS[colId]}</span>
        {jobs.length > 0 && (
          <span className="text-[11px] text-foreground/40 bg-black/8 rounded-full px-1.5 py-0.5 leading-none">
            {jobs.length}
          </span>
        )}
        {isPicks && isRescanning && (
          <span className="text-[10px] text-[#FF553E]/70 ml-auto">scanning…</span>
        )}
      </div>
      <KanbanColumnContent
        value={colId}
        className="flex-1 overflow-y-auto px-2 pt-2 pb-3 min-h-[60px]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cardList}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}
