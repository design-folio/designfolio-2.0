import { motion } from "framer-motion";
import { Kanban, KanbanBoard, KanbanOverlay } from "@/components/ui/kanban";
import { PipelineCol } from "./PipelineCol";
import { JobCard } from "./JobCard";
import { COL_ORDER } from "@/data/jobs";

const PIPELINE_COL_COUNT = COL_ORDER.filter((c) => c !== "picks").length;

export function DashboardColumns({
  picksRef,
  phase,
  centerMargin,
  picksCollapsed,
  archivedCollapsed,
  filteredPicks,
  columns,
  isRescanning,
  showJoyride,
  rescanExhausted,
  onColumnsChange,
  onShortlist,
  onOpenJob,
  onDismiss,
  onMockInterview,
  onAskScout,
  onFetchMore,
  onTogglePicksCollapse,
  onToggleArchive,
  onOfferDecide,
}) {
  const findJob = (id) => Object.values(columns).flat().find((j) => j.id === id);

  return (
    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
      <Kanban
        value={columns}
        onValueChange={onColumnsChange}
        getItemValue={(job) => job.id}
        className="h-full"
      >
        <KanbanBoard className="flex h-full pt-4 pr-4 pb-4 pl-[108px]">
          {/* Picks column */}
          <motion.div
            ref={picksRef}
            animate={{ width: picksCollapsed ? 43 : phase === "list" ? 500 : 350 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            style={{
              flex: phase === "split" || phase === "settled" ? "0 0 auto" : "none",
              marginLeft: phase === "split" || phase === "settled" ? 0 : centerMargin,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <PipelineCol
              colId="picks"
              colIndex={0}
              jobs={filteredPicks}
              onShortlist={onShortlist}
              onOpenJob={onOpenJob}
              onDismiss={onDismiss}
              onMockInterview={onMockInterview}
              onAskScout={onAskScout}
              onExhausted={rescanExhausted ? undefined : onFetchMore}
              isRescanning={isRescanning}
              isListPhase={phase === "list"}
              isCollapsed={picksCollapsed}
              onToggleCollapse={onTogglePicksCollapse}
              joyrideActive={showJoyride}
            />
          </motion.div>

          {/* Pipeline columns */}
          {COL_ORDER.filter((c) => c !== "picks").map((colId, i) => (
            <motion.div
              key={colId}
              className="overflow-hidden flex-shrink-0 h-full"
              initial={{ maxWidth: 0, opacity: 0 }}
              animate={{
                maxWidth: phase === "split" ? 362 : 0,
                opacity: phase === "split" ? 1 : 0,
              }}
              transition={{
                maxWidth: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: phase === "split" ? i * 0.12 : 0 },
                opacity: { duration: 0.4, ease: "easeOut", delay: phase === "split" ? i * 0.12 + 0.1 : 0 },
              }}
            >
              <div className="flex flex-col w-[350px] ml-3 h-full">
                <PipelineCol
                  colId={colId}
                  colIndex={i + 1}
                  jobs={columns[colId] ?? []}
                  onShortlist={onShortlist}
                  onOpenJob={onOpenJob}
                  onDismiss={onDismiss}
                  onMockInterview={onMockInterview}
                  onAskScout={onAskScout}
                  onDecide={colId === "offer" ? onOfferDecide : undefined}
                />
              </div>
            </motion.div>
          ))}

          {/* Archived column — separate for collapse animation */}
          <motion.div
            className="overflow-hidden flex-shrink-0 h-full"
            initial={{ maxWidth: 0, opacity: 0 }}
            animate={{
              maxWidth: phase === "split" ? 362 : 0,
              opacity: phase === "split" ? 1 : 0,
            }}
            transition={{
              maxWidth: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: phase === "split" ? PIPELINE_COL_COUNT * 0.12 : 0 },
              opacity: { duration: 0.4, ease: "easeOut", delay: phase === "split" ? PIPELINE_COL_COUNT * 0.12 + 0.1 : 0 },
            }}
          >
            <motion.div
              className="flex flex-col h-full ml-3 overflow-hidden"
              animate={{ width: archivedCollapsed ? 43 : 350 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              <PipelineCol
                colId="archived"
                colIndex={COL_ORDER.length}
                jobs={columns.archived ?? []}
                onShortlist={onShortlist}
                onOpenJob={onOpenJob}
                onDismiss={onDismiss}
                onMockInterview={onMockInterview}
                onAskScout={onAskScout}
                collapsed={archivedCollapsed}
                onToggleCollapse={onToggleArchive}
              />
            </motion.div>
          </motion.div>

          <div className="flex-shrink-0 w-10 h-full" />
        </KanbanBoard>

        <KanbanOverlay>
          {({ value, variant }) => {
            if (variant === "item") {
              const job = findJob(value);
              if (job) {
                const inPicks = (columns.picks || []).some((j) => j.id === value);
                return (
                  <div className="rounded-lg shadow-xl ring-1 ring-foreground/10 opacity-95 rotate-1 scale-[1.02]">
                    <JobCard
                      job={job}
                      onShortlist={inPicks ? () => {} : undefined}
                      onMockInterview={!inPicks ? () => {} : undefined}
                      onAskScout={() => {}}
                      onOpen={() => {}}
                    />
                  </div>
                );
              }
            }
            return <div className="rounded-xl bg-muted/60 border border-border w-full h-full" />;
          }}
        </KanbanOverlay>
      </Kanban>
    </div>
  );
}
