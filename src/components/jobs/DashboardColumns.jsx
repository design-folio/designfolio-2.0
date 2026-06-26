import { useState, useEffect, useCallback, startTransition } from "react";
import { motion } from "motion/react";
import { Kanban, KanbanBoard, KanbanOverlay } from "@/components/ui/kanban";
import { PipelineCol } from "./PipelineCol";
import { JobCard } from "./JobCard";
import { COL_ORDER, COL_LABELS } from "@/data/jobs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("picks");

  // Mirror the desktop split animation: switch to saved tab when pipeline unlocks
  useEffect(() => {
    if (phase === "split" && isMobile) startTransition(() => setActiveTab("saved"));
  }, [phase, isMobile]);

  const findJob = (id) =>
    Object.values(columns)
      .flat()
      .find((j) => j.id === id);

  const handleMoveJob = useCallback(
    (jobId, targetColId) => {
      const sourceColId = Object.keys(columns).find((col) =>
        (columns[col] ?? []).some((j) => j.id === jobId)
      );
      if (!sourceColId || sourceColId === targetColId) return;
      const job = columns[sourceColId].find((j) => j.id === jobId);
      onColumnsChange({
        ...columns,
        [sourceColId]: columns[sourceColId].filter((j) => j.id !== jobId),
        [targetColId]: [job, ...(columns[targetColId] ?? [])],
      });
      setActiveTab(targetColId);
    },
    [columns, onColumnsChange]
  );

  // ── Mobile tab-based kanban ───────────────────────────────────────────────
  const mobileTabs = [
    { id: "picks", label: COL_LABELS.picks, jobs: filteredPicks, colIndex: 0 },
    ...COL_ORDER.filter((c) => c !== "picks").map((colId, i) => ({
      id: colId,
      label: COL_LABELS[colId],
      jobs: columns[colId] ?? [],
      colIndex: i + 1,
    })),
    {
      id: "archived",
      label: COL_LABELS.archived,
      jobs: columns.archived ?? [],
      colIndex: COL_ORDER.length,
    },
  ];

  if (isMobile) {
    const activeTabData = mobileTabs.find((t) => t.id === activeTab) ?? mobileTabs[0];
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Column tab strip — only visible after first shortlist */}
        {phase === "split" && (
          <div
            className="shrink-0 overflow-x-auto border-b border-black/[0.06] dark:border-border"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex gap-1.5 px-4 py-2 w-max">
              {mobileTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-foreground text-background"
                      : "bg-white dark:bg-card border border-black/[0.06] dark:border-border text-foreground/60"
                  )}
                >
                  {tab.label}
                  {tab.jobs.length > 0 && (
                    <span
                      className={cn(
                        "flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold",
                        activeTab === tab.id
                          ? "bg-background/20 text-background"
                          : "bg-foreground/10 text-foreground/70"
                      )}
                    >
                      {tab.jobs.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active column — full-width, vertically scrolling */}
        <Kanban
          value={columns}
          onValueChange={onColumnsChange}
          getItemValue={(job) => job.id}
          className="flex-1 min-h-0"
        >
          <KanbanBoard className="flex h-full p-2 pb-4">
            <PipelineCol
              colId={activeTabData.id}
              colIndex={activeTabData.colIndex}
              jobs={activeTabData.id === "picks" ? filteredPicks : activeTabData.jobs}
              onShortlist={onShortlist}
              onOpenJob={onOpenJob}
              onDismiss={onDismiss}
              onMockInterview={onMockInterview}
              onAskScout={onAskScout}
              onMoveTo={handleMoveJob}
              onExhausted={
                activeTabData.id === "picks" && !rescanExhausted ? onFetchMore : undefined
              }
              isRescanning={isRescanning && activeTabData.id === "picks"}
              isListPhase={phase === "list"}
              isCollapsed={
                activeTabData.id === "archived"
                  ? archivedCollapsed
                  : activeTabData.id === "picks"
                    ? picksCollapsed
                    : false
              }
              onToggleCollapse={
                activeTabData.id === "archived"
                  ? onToggleArchive
                  : activeTabData.id === "picks"
                    ? onTogglePicksCollapse
                    : undefined
              }
              joyrideActive={showJoyride && activeTabData.id === "picks"}
              onDecide={activeTabData.id === "offer" ? onOfferDecide : undefined}
            />
          </KanbanBoard>
          <KanbanOverlay>
            {({ value: overlayValue, variant }) => {
              if (variant === "item") {
                const job = findJob(overlayValue);
                if (job) {
                  const inPicks = (columns.picks || []).some((j) => j.id === overlayValue);
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

  return (
    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden custom-thin-scrollbar">
      <Kanban
        value={columns}
        onValueChange={onColumnsChange}
        getItemValue={(job) => job.id}
        className="h-full"
      >
        <KanbanBoard className="flex h-full pt-4 pr-4 pb-4 pl-4">
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
              className="overflow-hidden shrink-0 h-full"
              initial={{ maxWidth: 0, opacity: 0 }}
              animate={{
                maxWidth: phase === "split" ? 362 : 0,
                opacity: phase === "split" ? 1 : 0,
              }}
              transition={{
                maxWidth: {
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                  delay: phase === "split" ? i * 0.12 : 0,
                },
                opacity: {
                  duration: 0.4,
                  ease: "easeOut",
                  delay: phase === "split" ? i * 0.12 + 0.1 : 0,
                },
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
            className="overflow-hidden shrink-0 h-full"
            initial={{ maxWidth: 0, opacity: 0 }}
            animate={{
              maxWidth: phase === "split" ? 362 : 0,
              opacity: phase === "split" ? 1 : 0,
            }}
            transition={{
              maxWidth: {
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
                delay: phase === "split" ? PIPELINE_COL_COUNT * 0.12 : 0,
              },
              opacity: {
                duration: 0.4,
                ease: "easeOut",
                delay: phase === "split" ? PIPELINE_COL_COUNT * 0.12 + 0.1 : 0,
              },
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

          <div className="shrink-0 w-10 h-full" />
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
