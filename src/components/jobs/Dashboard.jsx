import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Sparkles, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Kanban, KanbanBoard, KanbanOverlay } from "@/components/ui/kanban";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { COL_ORDER } from "@/data/jobs";
import { PipelineCol } from "./PipelineCol";
import { JobDetailSheet } from "./JobDetailSheet";
import { MockInterviewDialog } from "./MockInterviewDialog";
import { MockInterviewRoom } from "./MockInterviewRoom";
import { ScoutChat } from "./ScoutChat";
import { JobCard } from "./JobCard";
import { _postJobsInteract } from "@/network/jobs";

const buildColumns = (jobs) => ({
  picks:       jobs ?? [],
  not_applied: [],
  applied:     [],
  interview:   [],
  offer:       [],
});

const COL_DRAG_ACTION = {
  not_applied: "saved",
  applied:     "applied",
  interview:   "interview",
  offer:       "offer",
};

const DEFAULT_FILTERS = { workMode: "all", type: "all", minMatch: 0 };

// ── Small toggle pill used inside the filter panel ────────────────────────
function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-foreground text-background border-foreground"
          : "border-black/10 dark:border-border text-foreground/60 hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function Dashboard({
  initialJobs     = [],
  initialColumns  = null,
  recommendationId = null,
  quizAnswers     = [],
}) {
  const [columns, setColumns] = useState(() =>
    initialColumns ?? buildColumns(initialJobs),
  );
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [selectedJobId,  setSelectedJobId]  = useState(null);
  const [interviewJobId, setInterviewJobId] = useState(null);
  const [roomJobId,      setRoomJobId]      = useState(null);
  const [scoutJobId,     setScoutJobId]     = useState(null);

  // If history restored jobs in pipeline columns (not_applied/applied/interview),
  // start directly in "split" so all columns are visible immediately.
  const hasRestoredPipeline = initialColumns
    ? ["not_applied", "applied", "interview"].some((c) => (initialColumns[c] || []).length > 0)
    : false;

  // 4-phase: list → shrinking → settled → split
  const [phase, setPhase] = useState(hasRestoredPipeline ? "split" : "list");
  const picksRef     = useRef(null);
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

  const allJobs    = Object.values(columns).flat();
  const findJob    = (id) => allJobs.find((j) => j.id === id);
  const selectedJob  = selectedJobId  ? allJobs.find((j) => j.id === selectedJobId)  ?? null : null;
  const interviewJob = interviewJobId ? allJobs.find((j) => j.id === interviewJobId) ?? null : null;
  const roomJob      = roomJobId      ? allJobs.find((j) => j.id === roomJobId)      ?? null : null;
  const scoutJob     = scoutJobId     ? allJobs.find((j) => j.id === scoutJobId)     ?? null : null;

  // ── Client-side filtering for the AI Picks column ─────────────────────
  const filteredPicks = useMemo(() => {
    return (columns.picks || []).filter((job) => {
      if (filters.workMode !== "all" && job.workMode !== filters.workMode) return false;
      if (filters.type     !== "all" && job.type     !== filters.type)     return false;
      if (job.match < filters.minMatch) return false;
      return true;
    });
  }, [columns.picks, filters]);

  const activeFilterCount = [
    filters.workMode !== "all",
    filters.minMatch > 0,
  ].filter(Boolean).length;

  // ── Interaction handlers ───────────────────────────────────────────────
  const handleOpenJob = useCallback(
    (id) => {
      setSelectedJobId(id);
      _postJobsInteract(recommendationId, id, "viewed");
    },
    [recommendationId],
  );

  const handleShortlist = useCallback(
    (id) => {
      setColumns((prev) => {
        const fromCol = Object.keys(prev).find((col) => prev[col].some((j) => j.id === id));
        if (!fromCol) return prev;
        const job = prev[fromCol].find((j) => j.id === id);
        return {
          ...prev,
          [fromCol]:   prev[fromCol].filter((j) => j.id !== id),
          not_applied: [{ ...job }, ...prev.not_applied],
        };
      });
      _postJobsInteract(recommendationId, id, "saved");

      if (phase !== "list") return;

      const CARD_EXIT_MS = 480;
      const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
      const dur  = "0.65s";

      setTimeout(() => {
        const el       = picksRef.current;
        const filterEl = filterBarRef.current;

        if (el) {
          const currentWidth = el.getBoundingClientRect().width;
          el.style.transition = "none";
          el.style.flex       = "none";
          el.style.width      = `${currentWidth}px`;
          el.style.marginLeft = `${centerMargin}px`;
          void el.offsetWidth;
          el.style.transition = `width ${dur} ${ease}, margin-left ${dur} ${ease}`;
          el.style.width      = "350px";
          el.style.marginLeft = "0px";
        }
        if (filterEl) {
          filterEl.style.transition  = "none";
          filterEl.style.marginLeft  = `${centerMargin}px`;
          void filterEl.offsetWidth;
          filterEl.style.transition  = `margin-left ${dur} ${ease}`;
          filterEl.style.marginLeft  = "0px";
        }
        setPhase("shrinking");

        setTimeout(() => {
          if (el)       { el.style.transition = ""; el.style.width = ""; el.style.flex = ""; el.style.marginLeft = ""; }
          if (filterEl) { filterEl.style.transition = ""; filterEl.style.marginLeft = ""; }
          setPhase("settled");
        }, 700);

        setTimeout(() => setPhase("split"), 960);
      }, CARD_EXIT_MS);
    },
    [phase, centerMargin, recommendationId],
  );

  const handleDismiss = useCallback(
    (id) => {
      setColumns((prev) => {
        const fromCol = Object.keys(prev).find((col) => prev[col].some((j) => j.id === id));
        if (!fromCol) return prev;
        return { ...prev, [fromCol]: prev[fromCol].filter((j) => j.id !== id) };
      });
      _postJobsInteract(recommendationId, id, "dismissed");
    },
    [recommendationId],
  );

  // ── Prompt pill summary from quiz answers ──────────────────────────────
  const promptSummary = useMemo(() => {
    if (!quizAnswers.length) return "AI-matched roles for your profile";
    const parts = [quizAnswers[0]?.answer, quizAnswers[1]?.answer].filter(Boolean);
    return parts.join(" · ") || "AI-matched roles for your profile";
  }, [quizAnswers]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#F0EDE7] dark:bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Top filter bar ──────────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 pl-[108px] pr-4 mt-6 mb-2">
        <div
          ref={filterBarRef}
          className="flex items-center gap-2"
          style={{ marginLeft: phase === "list" || phase === "shrinking" ? centerMargin : 0 }}
        >
          {/* Prompt pill */}
          <div className="flex items-center gap-2.5 bg-white dark:bg-card border border-black/8 dark:border-border rounded-full pl-1.5 pr-4 h-9 text-sm text-foreground min-w-0 max-w-[360px] select-none">
            <Avatar className="w-6 h-6 flex-shrink-0 border border-black/10 dark:border-white/10">
              <AvatarFallback className="text-[10px]">AI</AvatarFallback>
            </Avatar>
            <span className="truncate text-[13px]">{promptSummary}</span>
          </div>

          {/* ── Filters popover ─────────────────────────────────────────── */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                data-testid="button-filters"
                className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border border-black/8 dark:border-border bg-white dark:bg-card text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={8}
              className="w-[272px] p-4 rounded-2xl border border-black/[0.08] dark:border-border shadow-xl bg-white dark:bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-foreground">Filter roles</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Work mode */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/35 mb-2">
                  Work mode
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "Remote", "On-site"].map((v) => (
                    <FilterPill
                      key={v}
                      active={filters.workMode === v}
                      onClick={() => setFilters((f) => ({ ...f, workMode: v }))}
                    >
                      {v === "all" ? "Any" : v}
                    </FilterPill>
                  ))}
                </div>
              </div>

              {/* Min match score */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/35 mb-2">
                  Min match score
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 50, 60, 70, 80, 90].map((v) => (
                    <FilterPill
                      key={v}
                      active={filters.minMatch === v}
                      onClick={() => setFilters((f) => ({ ...f, minMatch: v }))}
                    >
                      {v === 0 ? "Any" : `${v}+`}
                    </FilterPill>
                  ))}
                </div>
              </div>

              {/* Live count */}
              <p className="mt-4 text-[11px] text-muted-foreground/50 text-center">
                {filteredPicks.length} of {(columns.picks || []).length} roles shown
              </p>
            </PopoverContent>
          </Popover>

          {/* ── Criteria popover ─────────────────────────────────────────── */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                data-testid="button-criteria"
                className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border border-black/8 dark:border-border bg-white dark:bg-card text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Criteria
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={8}
              className="w-[320px] p-0 rounded-2xl border border-black/[0.08] dark:border-border shadow-xl bg-white dark:bg-card overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-black/[0.06] dark:border-border">
                <p className="text-[13px] font-semibold text-foreground">Your search criteria</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                  Used to find and rank your matched roles
                </p>
              </div>

              {quizAnswers.length > 0 ? (
                <div className="divide-y divide-black/[0.04] dark:divide-border">
                  {quizAnswers.map((qa, i) => (
                    <div key={i} className="px-4 py-3">
                      <p className="text-[11px] text-foreground/40 leading-snug mb-1">
                        {qa.question}
                      </p>
                      <p className="text-[13px] font-medium text-foreground/80 leading-snug">
                        {qa.answer || <span className="text-foreground/30 italic">Skipped</span>}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-[12px] text-muted-foreground/50">
                    No criteria recorded for this session.
                  </p>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ── Kanban board ────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <Kanban
          value={columns}
          onValueChange={(newCols) => {
            // Detect column moves for drag-and-drop interaction tracking
            Object.keys(newCols).forEach((colId) => {
              const action = COL_DRAG_ACTION[colId];
              if (!action) return;
              const prevIds = new Set((columns[colId] || []).map((j) => j.id));
              (newCols[colId] || []).forEach((job) => {
                if (!prevIds.has(job.id)) {
                  _postJobsInteract(recommendationId, job.id, action);
                }
              });
            });
            setColumns(newCols);
          }}
          getItemValue={(job) => job.id}
          className="h-full"
        >
          <KanbanBoard className="flex h-full pt-4 pr-4 pb-4 pl-[108px]">
            {/* AI Picks — centered in list mode, shrinks on shortlist */}
            <div
              ref={picksRef}
              style={{
                flex:        phase === "split" || phase === "settled" ? "0 0 350px" : "none",
                width:       phase === "split" || phase === "settled" ? undefined : "520px",
                marginLeft:  phase === "split" || phase === "settled" ? 0 : centerMargin,
                height:      "100%",
                display:     "flex",
                flexDirection: "column",
              }}
            >
              <PipelineCol
                colId="picks"
                colIndex={0}
                jobs={filteredPicks}
                onShortlist={handleShortlist}
                onOpenJob={handleOpenJob}
                onDismiss={handleDismiss}
                onMockInterview={setInterviewJobId}
                onAskScout={setScoutJobId}
                filterActive={activeFilterCount > 0}
                totalCount={(columns.picks || []).length}
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
                  opacity:  phase === "split" ? 1 : 0,
                }}
                transition={{
                  maxWidth: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: phase === "split" ? i * 0.12 : 0 },
                  opacity:  { duration: 0.4,  ease: "easeOut",           delay: phase === "split" ? i * 0.12 + 0.1 : 0 },
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
              return <div className="rounded-xl bg-muted/60 border border-border w-full h-full" />;
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
        onStart={() => { setRoomJobId(interviewJobId); setInterviewJobId(null); }}
      />

      {createPortal(
        <AnimatePresence>
          {roomJob  && <MockInterviewRoom key={roomJob.id}  job={roomJob}  onEnd={() => setRoomJobId(null)} />}
          {scoutJob && <ScoutChat         key={scoutJob.id} job={scoutJob} recommendationId={recommendationId} onClose={() => setScoutJobId(null)} />}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  );
}
