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
}) {
  const isPicks = colId === "picks";
  const isInterview = colId === "interview";

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
      {jobs.length === 0 && (
        <div className="flex items-center justify-center py-10 rounded-lg border border-dashed border-black/10 dark:border-border/50 mx-0.5">
          <p className="text-[11px] text-muted-foreground/40 text-center leading-relaxed">
            Drag a role here
            <br />
            to track it
          </p>
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
      </div>
      <KanbanColumnContent
        value={colId}
        className="flex-1 overflow-y-auto scrollbar-hide px-2 pt-2 pb-3 min-h-[60px]"
      >
        {cardList}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}
