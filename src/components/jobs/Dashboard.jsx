import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Sparkles, RotateCcw, Search } from "lucide-react";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Kanban, KanbanBoard, KanbanOverlay } from "@/components/ui/kanban";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { COL_ORDER } from "@/data/jobs";
import { PipelineCol } from "./PipelineCol";
import { JobDetailSheet } from "./JobDetailSheet";
import { MockInterviewDialog } from "./MockInterviewDialog";
import { MockInterviewRoom } from "./MockInterviewRoom";
import { InterviewReport } from "./InterviewReport";
import { ScoutChat } from "./ScoutChat";
import { JobCard } from "./JobCard";
import { _postJobsInteract, _postJobsRecommend, _postJobsMore, _postJobsInterviewReport, _getJobsRecommendations, _getJobRoleSuggestions, _getJobCredits, _postJobsPipelineReorder } from "@/network/jobs";
import { OfferDecisionScout } from "./OfferDecisionScout";
import { CreditsWidget } from "./CreditsWidget";
import { creditBadge, JOB_CREDITS } from "@/data/jobCredits";

const buildColumns = (jobs) => ({
  picks:     jobs ?? [],
  saved:     [],
  applied:   [],
  interview: [],
  offer:     [],
  archived:  [],
});

const COL_DRAG_ACTION = {
  saved:     "saved",
  applied:   "applied",
  interview: "interview",
  offer:     "offer",
  archived:  "archived",
};

const DEFAULT_FILTERS = { workMode: "all", type: "all", minMatch: 0 };

const LOCATION_OPTIONS = ["Location", "Remote only"];

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

function CriteriaEditor({ answers, onRescan, isRescanning }) {
  const [role,           setRole]           = useState(answers[0]?.answer || "");
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const suggestTimerRef = useRef(null);

  useEffect(() => {
    clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await _getJobRoleSuggestions(role);
        setRoleSuggestions(data.suggestions || []);
      } catch {
        setRoleSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(suggestTimerRef.current);
  }, [role]);

  const [locationChoice, setLocationChoice] = useState(() => {
    const raw = answers[1]?.answer || "";
    if (raw === "Remote only") return "Remote only";
    if (raw.includes(": ")) return "Location";
    return null;
  });
  const [city, setCity] = useState(() => {
    const raw = answers[1]?.answer || "";
    if (raw.includes(": ")) return raw.split(": ").slice(1).join(": ");
    return "";
  });

  const isDirty = useMemo(() => {
    const locAnswer = locationChoice === "Remote only"
      ? "Remote only"
      : locationChoice ? `${locationChoice}: ${city}` : "";
    return (
      role !== (answers[0]?.answer || "") ||
      locAnswer !== (answers[1]?.answer || "")
    );
  }, [role, locationChoice, city, answers]);

  const canRescan = role.trim().length > 0 &&
    locationChoice !== null &&
    (locationChoice === "Remote only" || city.trim().length > 0);

  const handleRescan = () => {
    if (!canRescan || isRescanning) return;
    const newAnswers = [
      { question: answers[0]?.question || "What role are you looking for next?", answer: role.trim() },
      { question: answers[1]?.question || "Where are you open to working?",
        answer: locationChoice === "Remote only" ? "Remote only" : `${locationChoice}: ${city.trim()}` },
    ];
    onRescan(newAnswers);
  };

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b border-black/[0.06] dark:border-border">
        <p className="text-[13px] font-semibold text-foreground">Your search criteria</p>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">Edit any field to rescan with new criteria</p>
      </div>

      <div className="divide-y divide-black/[0.04] dark:divide-border">
        {/* Role */}
        <div className="px-4 py-3">
          <p className="text-[11px] text-foreground/40 mb-2">{answers[0]?.question || "Role"}</p>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-border rounded-xl px-3 py-2 text-[13px] text-foreground outline-none focus:border-foreground/25 transition-colors"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {roleSuggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => setRole(s.label)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  role === s.label
                    ? "bg-foreground text-background border-foreground"
                    : "border-black/10 dark:border-border text-foreground/50 hover:border-foreground/30"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="px-4 py-3">
          <p className="text-[11px] text-foreground/40 mb-2">{answers[1]?.question || "Location"}</p>
          <div className="flex flex-wrap gap-1.5">
            {LOCATION_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { setLocationChoice(opt); if (opt === "Remote only") setCity(""); }}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  locationChoice === opt
                    ? "bg-foreground text-background border-foreground"
                    : "border-black/10 dark:border-border text-foreground/60 hover:border-foreground/30"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {locationChoice && locationChoice !== "Remote only" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 overflow-visible"
              >
                <LocationAutocomplete
                  value={city}
                  onChange={setCity}
                  onSelect={setCity}
                  placeholder="City name"
                  size="sm"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Rescan button */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={handleRescan}
          disabled={!canRescan || !isDirty || isRescanning}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
            isDirty && canRescan && !isRescanning
              ? "bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
              : "bg-black/[0.05] dark:bg-white/[0.06] text-foreground/40 cursor-not-allowed"
          }`}
        >
          {isRescanning ? (
            <>
              <div className="flex gap-[3px]">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-1 h-1 rounded-full bg-current"
                    animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
              Scanning…
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              {isDirty ? "Rescan with new criteria" : "Change criteria to rescan"}
              <span className="text-[10px] font-normal opacity-50 ml-1">· {creditBadge('jobRecommendation')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function Dashboard({
  initialJobs      = [],
  initialColumns   = null,
  profileId:       initialProfileId = null,
  quizAnswers      = [],
}) {
  const [columns,        setColumns]        = useState(() => initialColumns ?? buildColumns(initialJobs));
  const [profileId,      setProfileId]      = useState(initialProfileId);
  const [currentAnswers, setCurrentAnswers] = useState(quizAnswers);
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [isRescanning,   setIsRescanning]   = useState(false);
  const [rescanExhausted, setRescanExhausted] = useState(false);

  // Track all job IDs ever shown to avoid duplicates when paginating
  const seenJobIds = useRef(new Set(initialJobs.map((j) => j.id)));

  const [selectedJobId,    setSelectedJobId]    = useState(null);
  const [interviewJobId,   setInterviewJobId]   = useState(null);
  const [roomJobId,        setRoomJobId]        = useState(null);
  const [scoutJobId,       setScoutJobId]       = useState(null);
  const [reportJobId,      setReportJobId]      = useState(null);
  const [reportLoading,    setReportLoading]    = useState(false);
  const [completedReports, setCompletedReports] = useState({});
  const [viewingReport,    setViewingReport]    = useState(null);
  const [offerDecisionOpen,  setOfferDecisionOpen]  = useState(false);
  const [archivedCollapsed, setArchivedCollapsed] = useState(() => {
    try { return localStorage.getItem('df_archived_collapsed') !== 'false'; } catch { return true; }
  });
  const handleToggleArchive = () => setArchivedCollapsed((v) => {
    const next = !v;
    try { localStorage.setItem('df_archived_collapsed', String(next)); } catch {}
    return next;
  });
  const [picksCollapsed, setPicksCollapsed] = useState(false);
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);
  const bumpCredits = useCallback(() => setCreditsRefreshKey(k => k + 1), []);
  const [creditBalance, setCreditBalance] = useState(null);

  useEffect(() => {
    let cancelled = false;
    _getJobCredits()
      .then((res) => { if (!cancelled) setCreditBalance(res.data?.balance ?? 0); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [creditsRefreshKey]);

  // Poll for scores when any pick is unscored — stops when all scored or after 5 min
  useEffect(() => {
    if (!profileId) return;
    const hasUnscored = () => (columns.picks || []).some((j) => j.match === null);
    if (!hasUnscored()) return;

    let attempts = 0;
    const MAX = 60; // 60 × 5s = 5 min
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > MAX) { clearInterval(interval); return; }
      try {
        const { data } = await _getJobsRecommendations(profileId, 0);
        if (!data?.jobs?.length) return;
        setColumns((prev) => {
          const updatedPicks = (prev.picks || []).map((existing) => {
            const fresh = data.jobs.find((j) => j.id === existing.id);
            if (!fresh) return existing;
            const updates = { logoUrl: fresh.logoUrl || existing.logoUrl };
            if (fresh.match !== null) Object.assign(updates, { match: fresh.match, reason: fresh.reason, matchReasons: fresh.matchReasons, emotionalLabel: fresh.emotionalLabel });
            return { ...existing, ...updates };
          });
          return { ...prev, picks: updatedPicks };
        });
      } catch {}
      if (!hasUnscored()) clearInterval(interval);
    }, 5000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, (columns.picks || []).some((j) => j.match === null)]);

  const hasRestoredPipeline = initialColumns
    ? ["saved", "applied", "interview", "offer", "archived"].some((c) => (initialColumns[c] || []).length > 0)
    : false;

  const [phase, setPhase] = useState(() => hasRestoredPipeline ? "split" : "list");
  const picksRef     = useRef(null);
  const filterBarRef = useRef(null);

  const [centerMargin, setCenterMargin] = useState(0);
  useEffect(() => {
    const compute = () => {
      const available = window.innerWidth - 108 - 16;
      setCenterMargin(Math.max(0, Math.floor((available - 350) / 2)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);


  // Persist pipeline column assignments (job IDs) for cross-navigation restore
  useEffect(() => {
    if (!profileId) return;
    try {
      const ids = {
        saved:     (columns.saved     || []).map((j) => j.id),
        applied:   (columns.applied   || []).map((j) => j.id),
        interview: (columns.interview || []).map((j) => j.id),
        offer:     (columns.offer     || []).map((j) => j.id),
        archived:  (columns.archived  || []).map((j) => j.id),
      };
      const hasAny = Object.values(ids).some((a) => a.length > 0);
      if (hasAny) {
        sessionStorage.setItem(`df_pipeline_${profileId}`, JSON.stringify(ids));
      } else {
        sessionStorage.removeItem(`df_pipeline_${profileId}`);
      }
    } catch {}
  }, [columns.saved, columns.applied, columns.interview, columns.offer, columns.archived, profileId]);

  const allJobs    = Object.values(columns).flat();
  const allJobsRef = useRef(allJobs);
  allJobsRef.current = allJobs;
  const findJob    = (id) => allJobs.find((j) => j.id === id);
  const selectedJob  = selectedJobId  ? allJobs.find((j) => j.id === selectedJobId)  ?? null : null;
  const interviewJob = interviewJobId ? allJobs.find((j) => j.id === interviewJobId) ?? null : null;
  const roomJob      = roomJobId      ? allJobs.find((j) => j.id === roomJobId)      ?? null : null;
  const scoutJob     = scoutJobId     ? allJobs.find((j) => j.id === scoutJobId)     ?? null : null;
  const reportJob    = reportJobId    ? allJobs.find((j) => j.id === reportJobId)    ?? null : null;

  const filteredPicks = useMemo(() => {
    return (columns.picks || []).filter((job) => {
      if (filters.workMode !== "all" && job.workMode !== filters.workMode) return false;
      if (filters.type     !== "all" && job.type     !== filters.type)     return false;
      if (job.match !== null && job.match < filters.minMatch) return false;
      return true;
    });
  }, [columns.picks, filters]);

  const activeFilterCount = [
    filters.workMode !== "all",
    filters.minMatch > 0,
  ].filter(Boolean).length;

  const handleFetchMore = useCallback(async () => {
    console.log("[Jobs] handleFetchMore called", { isRescanning, rescanExhausted, profileId });
    if (isRescanning || rescanExhausted || !profileId) return;
    setIsRescanning(true);
    try {
      await _postJobsMore(profileId);
      bumpCredits();

      // Poll until Lambda appends new picks and sets status="ready"
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const { data } = await _getJobsRecommendations(profileId, 0);
        if (data.status === "ready") {
          // Fetch the next page based on how many picks are already displayed
          const nextPage = Math.floor((columns.picks || []).length / 10);
          const { data: pageData } = await _getJobsRecommendations(profileId, nextPage, 10);
          const newJobs = (pageData.jobs || []).filter((j) => !seenJobIds.current.has(j.id));
          if (newJobs.length > 0) {
            newJobs.forEach((j) => seenJobIds.current.add(j.id));
            setColumns((prev) => ({ ...prev, picks: [...(prev.picks || []), ...newJobs] }));
          } else {
            setRescanExhausted(true);
          }
          break;
        }
        if (data.status === "exhausted") { setRescanExhausted(true); break; }
      }
    } catch (err) {
      console.error("[Jobs] fetchMore failed:", err);
    } finally {
      setIsRescanning(false);
    }
  }, [isRescanning, rescanExhausted, profileId, columns.picks, bumpCredits]);

  const handleRescan = useCallback(async (answers = currentAnswers) => {
    if (isRescanning) return;
    setIsRescanning(true);
    setRescanExhausted(false);
    seenJobIds.current.clear();
    try {
      const { data } = await _postJobsRecommend(answers);
      bumpCredits();
      const newProfileId = data.profileId;
      setProfileId(newProfileId);
      setCurrentAnswers(answers);

      // Poll until ready — keep pipeline columns; only replace picks
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const { data: pollData } = await _getJobsRecommendations(newProfileId);
        if (pollData.status === "ready") {
          const newPicks = pollData.jobs || [];
          newPicks.forEach((j) => seenJobIds.current.add(j.id));
          setColumns((prev) => ({ ...prev, picks: newPicks }));
          break;
        }
        if (pollData.status === "exhausted") break;
      }
    } catch (err) {
      console.error("[Jobs] Rescan failed:", err);
    } finally {
      setIsRescanning(false);
    }
  }, [isRescanning, currentAnswers, bumpCredits]);

  const handleOpenJob = useCallback(
    (id) => {
      const job = allJobsRef.current.find((j) => j.id === id);
      if (!job || job.match === null) return;
      setSelectedJobId(id);
    },
    [],
  );

  const handleShortlist = useCallback(
    (id) => {
      setColumns((prev) => {
        const fromCol = Object.keys(prev).find((col) => prev[col].some((j) => j.id === id));
        if (!fromCol) return prev;
        const job = prev[fromCol].find((j) => j.id === id);
        return {
          ...prev,
          [fromCol]: prev[fromCol].filter((j) => j.id !== id),
          saved:     [{ ...job }, ...(prev.saved || [])],
        };
      });
      _postJobsInteract(profileId, id, "saved");

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
    [phase, centerMargin, profileId],
  );

  const handleDismiss = useCallback(
    (id) => {
      setColumns((prev) => {
        const fromCol = Object.keys(prev).find((col) => prev[col].some((j) => j.id === id));
        if (!fromCol) return prev;
        return { ...prev, [fromCol]: prev[fromCol].filter((j) => j.id !== id) };
      });
      _postJobsInteract(profileId, id, "dismissed");
    },
    [profileId],
  );

  const promptSummary = useMemo(() => {
    if (!currentAnswers.length) return "AI-matched roles for your profile";
    const parts = [
      currentAnswers[0]?.answer,
      currentAnswers[1]?.answer,
      currentAnswers[2]?.answer,
    ].filter(Boolean);
    return parts.join(" · ") || "AI-matched roles for your profile";
  }, [currentAnswers]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#F0EDE7] dark:bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Top filter bar ──────────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 pl-[108px] pr-4 mt-6 mb-2 items-center">
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

          {/* ── Filters + Criteria — hidden in list-only (AI picks) view ── */}
          {phase === "split" && <><Popover>
            <PopoverTrigger asChild>
              <button
                data-testid="button-filters"
                className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border border-black/[0.08] dark:border-border bg-white dark:bg-card text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
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
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    Reset
                  </button>
                )}
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/35 mb-2">Work mode</p>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "Remote", "On-site"].map((v) => (
                    <FilterPill key={v} active={filters.workMode === v} onClick={() => setFilters((f) => ({ ...f, workMode: v }))}>
                      {v === "all" ? "Any" : v}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/35 mb-2">Min match score</p>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 50, 60, 70, 80, 90].map((v) => (
                    <FilterPill key={v} active={filters.minMatch === v} onClick={() => setFilters((f) => ({ ...f, minMatch: v }))}>
                      {v === 0 ? "Any" : `${v}+`}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground/50 text-center">
                {filteredPicks.length} of {(columns.picks || []).length} roles shown
              </p>
            </PopoverContent>
          </Popover>

          {/* ── Criteria popover — now editable ─────────────────────────── */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                data-testid="button-criteria"
                className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full border border-black/[0.08] dark:border-border bg-white dark:bg-card text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Criteria
                {currentAnswers.length > 0 && !isRescanning && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-background text-[10px] font-semibold">
                    {currentAnswers.filter(a => a.answer).length}
                  </span>
                )}
                {isRescanning && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF553E] animate-pulse" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={8}
              className="w-[340px] p-0 rounded-2xl border border-black/[0.08] dark:border-border shadow-xl bg-white dark:bg-card overflow-hidden"
            >
              {currentAnswers.length > 0 ? (
                <CriteriaEditor
                  answers={currentAnswers}
                  onRescan={handleRescan}
                  isRescanning={isRescanning}
                />
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-[12px] text-muted-foreground/50">No criteria recorded for this session.</p>
                </div>
              )}
            </PopoverContent>
          </Popover></>}

          {/* Exhausted notice */}
          {rescanExhausted && (
            <span className="text-[11px] text-muted-foreground/50 px-2">
              No more new roles found
            </span>
          )}
        </div>
        {/* Credits widget — right extreme */}
        <div className="ml-auto">
          <CreditsWidget refreshKey={creditsRefreshKey} />
        </div>
      </div>

      {/* ── Kanban board ────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <Kanban
          value={columns}
          onValueChange={(newCols) => {
            Object.keys(newCols).forEach((colId) => {
              const action = COL_DRAG_ACTION[colId];
              if (!action) return;

              const prevIds = (columns[colId] || []).map((j) => j.id);
              const newIds  = (newCols[colId]  || []).map((j) => j.id);
              const prevSet = new Set(prevIds);

              // Cross-column move: a new job entered this column
              const entered = newIds.filter((id) => !prevSet.has(id));
              entered.forEach((id) => _postJobsInteract(profileId, id, action));

              // Within-column reorder: same set of IDs but different order
              if (
                entered.length === 0 &&
                newIds.length === prevIds.length &&
                prevIds.some((id, i) => id !== newIds[i])
              ) {
                _postJobsPipelineReorder(profileId, colId, newIds);
              }
            });
            setColumns(newCols);
          }}
          getItemValue={(job) => job.id}
          className="h-full"
        >
          <KanbanBoard className="flex h-full pt-4 pr-4 pb-4 pl-[108px]">
            <motion.div
              ref={picksRef}
              animate={{ width: picksCollapsed ? 43 : (phase === "list" ? 420 : 350) }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flex:          phase === "split" || phase === "settled" ? "0 0 auto" : "none",
                marginLeft:    phase === "split" || phase === "settled" ? 0 : centerMargin,
                height:        "100%",
                display:       "flex",
                flexDirection: "column",
                overflow:      "hidden",
                flexShrink:    0,
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
                onExhausted={rescanExhausted ? undefined : handleFetchMore}
                canFetchMore={creditBalance === null || creditBalance >= (JOB_CREDITS.jobRecommendation?.cost ?? 15)}
                isRescanning={isRescanning}
                isListPhase={phase === "list"}
                isCollapsed={picksCollapsed}
                onToggleCollapse={() => setPicksCollapsed((v) => !v)}
              />
            </motion.div>

            {COL_ORDER.filter((c) => c !== "picks").map((colId, i) => (
              <motion.div
                key={colId}
                className="overflow-hidden flex-shrink-0 h-full"
                initial={{ maxWidth: 0, opacity: 0 }}
                animate={{
                  maxWidth: phase === "split" ? 362 : 0,
                  opacity:  phase === "split" ? 1   : 0,
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
                    onDecide={colId === "offer" ? () => setOfferDecisionOpen(true) : undefined}
                  />
                </div>
              </motion.div>
            ))}

            {/* Archived column — always last, collapsible */}
            <motion.div
              className="overflow-hidden flex-shrink-0 h-full"
              initial={{ maxWidth: 0, opacity: 0 }}
              animate={{
                maxWidth: phase === "split" ? 362 : 0,
                opacity:  phase === "split" ? 1   : 0,
              }}
              transition={{
                maxWidth: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: phase === "split" ? COL_ORDER.filter((c) => c !== "picks").length * 0.12 : 0 },
                opacity:  { duration: 0.4,  ease: "easeOut",           delay: phase === "split" ? COL_ORDER.filter((c) => c !== "picks").length * 0.12 + 0.1 : 0 },
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
                  onShortlist={handleShortlist}
                  onOpenJob={handleOpenJob}
                  onDismiss={handleDismiss}
                  onMockInterview={setInterviewJobId}
                  onAskScout={setScoutJobId}
                  collapsed={archivedCollapsed}
                  onToggleCollapse={handleToggleArchive}
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

      <JobDetailSheet
        job={selectedJob}
        open={!!selectedJobId}
        profileId={profileId}
        onClose={() => setSelectedJobId(null)}
        pastReports={selectedJob ? (completedReports[selectedJob.id] ?? []).slice().reverse() : []}
        onViewReport={(entry) => {
          if (selectedJob) setViewingReport({ job: selectedJob, entry });
        }}
        onCreditUsed={bumpCredits}
        onStartMockInterview={selectedJobId ? () => { setInterviewJobId(selectedJobId); setSelectedJobId(null); } : undefined}
      />
      <MockInterviewDialog
        job={interviewJob}
        open={!!interviewJobId}
        onClose={() => setInterviewJobId(null)}
        onStart={() => { setRoomJobId(interviewJobId); setInterviewJobId(null); }}
      />

      {createPortal(
        <AnimatePresence>
          {roomJob  && (
            <MockInterviewRoom
              key={roomJob.id}
              job={roomJob}
              profileId={profileId}
              onEnd={(transcript) => {
                const finishedId = roomJobId;
                setRoomJobId(null);
                if (!finishedId) return;
                setReportJobId(finishedId);
                setReportLoading(true);
                _postJobsInterviewReport(finishedId, profileId, transcript)
                  .then(({ data }) => {
                    setCompletedReports((prev) => ({
                      ...prev,
                      [finishedId]: [
                        ...(prev[finishedId] ?? []),
                        { date: new Date().toISOString(), report: data.report },
                      ],
                    }));
                    setReportLoading(false);
                  })
                  .catch(() => setReportLoading(false));
              }}
            />
          )}
          {reportJob && (
            <InterviewReport
              key={`report-${reportJob.id}`}
              job={reportJob}
              report={completedReports[reportJob.id]?.at(-1)?.report ?? null}
              loading={reportLoading}
              onClose={() => setReportJobId(null)}
            />
          )}
          {viewingReport && (
            <InterviewReport
              key={`viewing-${viewingReport.job.id}-${viewingReport.entry.date}`}
              job={viewingReport.job}
              report={viewingReport.entry.report}
              onClose={() => setViewingReport(null)}
            />
          )}
          {scoutJob && <ScoutChat key={scoutJob.id} job={scoutJob} profileId={profileId} onClose={() => setScoutJobId(null)} />}
          {offerDecisionOpen && (columns.offer || []).length >= 2 && (
            <OfferDecisionScout
              key="offer-decision"
              jobs={(columns.offer || []).slice(0, 2)}
              profileId={profileId}
              onClose={() => setOfferDecisionOpen(false)}
              onCreditUsed={bumpCredits}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  );
}
