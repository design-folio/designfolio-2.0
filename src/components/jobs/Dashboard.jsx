import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Kanban, KanbanBoard, KanbanOverlay } from "@/components/ui/kanban";
import { COL_ORDER } from "@/data/jobs";
import { PipelineCol } from "./PipelineCol";
import { JobDetailSheet } from "./JobDetailSheet";
import { MockInterviewDialog } from "./MockInterviewDialog";
import { MockInterviewRoom } from "./MockInterviewRoom";
import { ScoutChat } from "./ScoutChat";
import { JobCard } from "./JobCard";
import { _postJobsInteract } from "@/network/jobs";

// NOTE: APIS TO BE INTEGRATED HERE — column state (picked/shortlisted/applied/interview)
// is currently in-memory only. When a user returns, all jobs re-appear in "picks".
// To persist: call PATCH /jobs/pipeline { recommendationId, columns: {picks:[], not_applied:[], ...} }
// and restore from GET /jobs/history (which should include column positions).

const buildColumns = (jobs) => ({
  picks: jobs ?? [],
  not_applied: [],
  applied: [],
  interview: [],
});

export function Dashboard({ initialJobs = [], recommendationId = null }) {
  const [columns, setColumns] = useState(() => buildColumns(initialJobs));
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [interviewJobId, setInterviewJobId] = useState(null);
  const [roomJobId, setRoomJobId] = useState(null);
  const [scoutJobId, setScoutJobId] = useState(null);
  // 4-phase: list → shrinking → settled → split
  const [phase, setPhase] = useState("list");
  const picksRef = useRef(null);
  const filterBarRef = useRef(null);

  const [centerMargin, setCenterMargin] = useState(0);
  useEffect(() => {
    const compute = () => {
      const available = window.innerWidth - 108 - 16;
      setCenterMargin(Math.max(0, Math.floor((available - 520) / 2)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const allJobs = Object.values(columns).flat();
  const findJob = (id) => allJobs.find((j) => j.id === id);

  const selectedJob = selectedJobId ? allJobs.find((j) => j.id === selectedJobId) ?? null : null;
  const interviewJob = interviewJobId ? allJobs.find((j) => j.id === interviewJobId) ?? null : null;
  const roomJob = roomJobId ? allJobs.find((j) => j.id === roomJobId) ?? null : null;
  const scoutJob = scoutJobId ? allJobs.find((j) => j.id === scoutJobId) ?? null : null;

  // Fire "viewed" when a job detail sheet opens
  const handleOpenJob = useCallback(
    (id) => {
      setSelectedJobId(id);
      _postJobsInteract(recommendationId, id, "viewed");
    },
    [recommendationId],
  );

  // Fire "saved" and animate column reveal
  const handleShortlist = useCallback(
    (id) => {
      setColumns((prev) => {
        const fromCol = Object.keys(prev).find((col) => prev[col].some((j) => j.id === id));
        if (!fromCol) return prev;
        const job = prev[fromCol].find((j) => j.id === id);
        // NOTE: APIS TO BE INTEGRATED HERE — PATCH /jobs/pipeline to persist column move
        return {
          ...prev,
          [fromCol]: prev[fromCol].filter((j) => j.id !== id),
          not_applied: [{ ...job }, ...prev.not_applied],
        };
      });

      _postJobsInteract(recommendationId, id, "saved");

      if (phase !== "list") return;

      const CARD_EXIT_MS = 480;
      const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
      const dur = "0.65s";

      setTimeout(() => {
        const el = picksRef.current;
        const filterEl = filterBarRef.current;

        if (el) {
          const currentWidth = el.getBoundingClientRect().width;
          el.style.transition = "none";
          el.style.flex = "none";
          el.style.width = `${currentWidth}px`;
          el.style.marginLeft = `${centerMargin}px`;
          void el.offsetWidth;
          el.style.transition = `width ${dur} ${ease}, margin-left ${dur} ${ease}`;
          el.style.width = "350px";
          el.style.marginLeft = "0px";
        }
        if (filterEl) {
          filterEl.style.transition = "none";
          filterEl.style.marginLeft = `${centerMargin}px`;
          void filterEl.offsetWidth;
          filterEl.style.transition = `margin-left ${dur} ${ease}`;
          filterEl.style.marginLeft = "0px";
        }
        setPhase("shrinking");

        setTimeout(() => {
          if (el) {
            el.style.transition = "";
            el.style.width = "";
            el.style.flex = "";
            el.style.marginLeft = "";
          }
          if (filterEl) {
            filterEl.style.transition = "";
            filterEl.style.marginLeft = "";
          }
          setPhase("settled");
        }, 700);

        setTimeout(() => setPhase("split"), 960);
      }, CARD_EXIT_MS);
    },
    [phase, centerMargin, recommendationId],
  );

  // Fire "dismissed" and remove card from its column
  const handleDismiss = useCallback(
    (id) => {
      setColumns((prev) => {
        const fromCol = Object.keys(prev).find((col) => prev[col].some((j) => j.id === id));
        if (!fromCol) return prev;
        // NOTE: APIS TO BE INTEGRATED HERE — PATCH /jobs/pipeline to persist dismiss
        return { ...prev, [fromCol]: prev[fromCol].filter((j) => j.id !== id) };
      });
      _postJobsInteract(recommendationId, id, "dismissed");
    },
    [recommendationId],
  );

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#F0EDE7] dark:bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top filter bar */}
      <div className="flex flex-shrink-0 pl-[108px] pr-4 mt-6 mb-2">
        <div
          ref={filterBarRef}
          className="flex items-center gap-2"
          style={{
            marginLeft:
              phase === "list" || phase === "shrinking" ? centerMargin : 0,
          }}
        >
          {/* Prompt pill */}
          <div className="flex items-center gap-2.5 bg-white dark:bg-card border border-black/8 dark:border-border rounded-full pl-1.5 pr-4 h-9 text-sm text-foreground min-w-0 max-w-[380px] select-none">
            <Avatar className="w-6 h-6 flex-shrink-0 border border-black/10 dark:border-white/10">
              <AvatarFallback className="text-[10px]">AI</AvatarFallback>
            </Avatar>
            {/* NOTE: APIS TO BE INTEGRATED HERE — display actual preferences once persisted */}
            <span className="truncate">AI-matched roles for your profile</span>
          </div>

          {/* Filters button */}
          {/* NOTE: APIS TO BE INTEGRATED HERE — open filter panel, re-call POST /jobs/recommend with updated filters */}
          <button
            data-testid="button-filters"
            className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border border-black/8 dark:border-border bg-white dark:bg-card text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          {/* Criteria button */}
          {/* NOTE: APIS TO BE INTEGRATED HERE — open criteria panel, GET /jobs/criteria or derive from recommendation */}
          <button
            data-testid="button-criteria"
            className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border border-black/8 dark:border-border bg-white dark:bg-card text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Criteria
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <Kanban
          value={columns}
          onValueChange={(newCols) => {
            // NOTE: APIS TO BE INTEGRATED HERE — PATCH /jobs/pipeline with new column state
            setColumns(newCols);
          }}
          getItemValue={(job) => job.id}
          className="h-full"
        >
          <KanbanBoard className="flex h-full pt-4 pr-4 pb-4 pl-[108px]">
            {/* AI Picks — centered at 520px in list mode, shrinks & snaps left on shortlist */}
            <div
              ref={picksRef}
              style={{
                flex: phase === "split" || phase === "settled" ? "0 0 350px" : "none",
                width: phase === "split" || phase === "settled" ? undefined : "520px",
                marginLeft: phase === "split" || phase === "settled" ? 0 : centerMargin,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <PipelineCol
                colId="picks"
                colIndex={0}
                jobs={columns.picks ?? []}
                onShortlist={handleShortlist}
                onOpenJob={handleOpenJob}
                onDismiss={handleDismiss}
                onMockInterview={setInterviewJobId}
                onAskScout={setScoutJobId}
              />
            </div>

            {/* Pipeline columns — stagger-reveal after AI Picks shrinks */}
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
                    onShortlist={handleShortlist}
                    onOpenJob={handleOpenJob}
                    onDismiss={handleDismiss}
                    onMockInterview={setInterviewJobId}
                    onAskScout={setScoutJobId}
                  />
                </div>
              </motion.div>
            ))}

            {/* Trailing spacer */}
            <div className="flex-shrink-0 w-10 h-full" />
          </KanbanBoard>

          <KanbanOverlay>
            {({ value, variant }) => {
              if (variant === "item") {
                const job = findJob(value);
                if (job) {
                  return (
                    <div className="rounded-lg shadow-xl ring-1 ring-foreground/10 opacity-95 rotate-1 scale-[1.02]">
                      <JobCard job={job} />
                    </div>
                  );
                }
              }
              return (
                <div className="rounded-xl bg-muted/60 border border-border w-full h-full" />
              );
            }}
          </KanbanOverlay>
        </Kanban>
      </div>

      <JobDetailSheet
        job={selectedJob}
        open={!!selectedJobId}
        recommendationId={recommendationId}
        onClose={() => setSelectedJobId(null)}
      />
      <MockInterviewDialog
        job={interviewJob}
        open={!!interviewJobId}
        onClose={() => setInterviewJobId(null)}
        onStart={() => {
          setRoomJobId(interviewJobId);
          setInterviewJobId(null);
        }}
      />

      {createPortal(
        <AnimatePresence>
          {roomJob && (
            <MockInterviewRoom
              key={roomJob.id}
              job={roomJob}
              onEnd={() => setRoomJobId(null)}
            />
          )}
          {scoutJob && (
            <ScoutChat
              key={scoutJob.id}
              job={scoutJob}
              onClose={() => setScoutJobId(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  );
}
