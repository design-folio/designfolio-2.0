import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
  startTransition,
} from "react";
import { toast } from "react-toastify";
import { motion } from "motion/react";
import { useRouter } from "next/router";
import { extractLinkedInJobId } from "@/lib/jobsUtils";
import {
  _postJobsInteract,
  _postJobsRecommend,
  _postJobsMore,
  _postJobsInterviewReport,
  _getJobsRecommendations,
  _postJobsPipelineReorder,
  _getJobsJobScore,
} from "@/network/jobs";
import { _getUserQuota } from "@/network/get-request";
import { useGlobalContext } from "@/context/globalContext";
import { JobDetailSheet } from "./JobDetailSheet";
import { MockInterviewDialog } from "./MockInterviewDialog";
import { AddJobDialog } from "./AddJobDialog";
import { SharedJobPromptDialog } from "./SharedJobPromptDialog";
import { FilterBar } from "./FilterBar";
import { DashboardColumns } from "./DashboardColumns";
import { PortalOverlays } from "./PortalOverlays";

const buildColumns = (jobs) => ({
  picks: jobs ?? [],
  saved: [],
  applied: [],
  interview: [],
  offer: [],
  archived: [],
});

const DEFAULT_FILTERS = { workMode: "all", type: "all", minMatch: 0 };

const COL_DRAG_ACTION = {
  saved: "saved",
  applied: "applied",
  interview: "interview",
  offer: "offer",
  archived: "archived",
};

// Scan pages 0, 1, 2... collecting picks not in seenIds until maxCount found.
// Needed because score-sort reshuffles page boundaries when new picks arrive —
// a fixed page number would miss picks that crossed a page boundary.
const JOB_BATCH_SIZE = 10;

const findUnseenPicks = async (profileId, seenIds, maxCount = JOB_BATCH_SIZE) => {
  const found = [];
  for (let page = 0; found.length < maxCount && page < 10; page++) {
    const { data } = await _getJobsRecommendations(profileId, page, JOB_BATCH_SIZE);
    const unseen = (data.jobs || []).filter((j) => !seenIds.has(j.id));
    found.push(...unseen);
    if (!data.hasMore) break;
  }
  return found.slice(0, maxCount);
};

export function Dashboard({
  initialJobs = [],
  initialColumns = null,
  profileId: initialProfileId = null,
  quizAnswers = [],
}) {
  const router = useRouter();
  const [columns, setColumns] = useState(() => initialColumns ?? buildColumns(initialJobs));
  const [profileId, setProfileId] = useState(initialProfileId);
  const [currentAnswers, setCurrentAnswers] = useState(quizAnswers);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanExhausted, setRescanExhausted] = useState(false);

  const seenJobIds = useRef(new Set(initialJobs.map((j) => j.id)));

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [interviewJobId, setInterviewJobId] = useState(null);
  const [roomJobId, setRoomJobId] = useState(null);
  const [scoutJobId, setScoutJobId] = useState(null);
  const [reportJobId, setReportJobId] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [completedReports, setCompletedReports] = useState({});
  const [viewingReport, setViewingReport] = useState(null);
  const [offerDecisionOpen, setOfferDecisionOpen] = useState(false);
  const [archivedCollapsed, setArchivedCollapsed] = useState(() => {
    try {
      return localStorage.getItem("df_archived_collapsed") !== "false";
    } catch {
      return true;
    }
  });
  const [picksCollapsed, setPicksCollapsed] = useState(false);
  const [showJoyride, setShowJoyride] = useState(() => {
    try {
      if (localStorage.getItem("df_jobs_joyride_seen")) return false;
      if (initialColumns) {
        const hasPipeline = ["saved", "applied", "interview", "offer", "archived"].some(
          (c) => (initialColumns[c] || []).length > 0
        );
        if (hasPipeline) return false;
      }
      return true;
    } catch {
      return false;
    }
  });
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);
  const bumpCredits = useCallback(() => setCreditsRefreshKey((k) => k + 1), []);

  const { setShowUpgradeModal, setUpgradeModalSource, setUpgradeModalJob } = useGlobalContext();
  const [mockInterviewCreditsRemaining, setMockInterviewCreditsRemaining] = useState(undefined);

  useEffect(() => {
    _getUserQuota()
      .then((res) => {
        const q = res.data?.quota;
        const base = q?.mockInterview ?? { limit: 0, used: 0 };
        const topup = q?.topup?.mockInterview ?? { limit: 0, used: 0 };
        const remaining =
          base.limit === null
            ? null
            : Math.max(0, base.limit - base.used + ((topup.limit ?? 0) - (topup.used ?? 0)));
        setMockInterviewCreditsRemaining(remaining);
      })
      .catch(() => {});
  }, [creditsRefreshKey]);

  const handleMockInterview = useCallback(
    (jobId) => {
      if (mockInterviewCreditsRemaining === 0) {
        const job = Object.values(columns)
          .flat()
          .find((j) => j.id === jobId);
        setUpgradeModalSource("mock-interview");
        setUpgradeModalJob({
          role: job?.role ?? "",
          company: job?.company ?? "",
          logoUrl: job?.logoUrl ?? null,
        });
        setShowUpgradeModal(true);
        return;
      }
      setInterviewJobId(jobId);
    },
    [
      mockInterviewCreditsRemaining,
      columns,
      setShowUpgradeModal,
      setUpgradeModalSource,
      setUpgradeModalJob,
    ]
  );
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [shareScoringJobId, setShareScoringJobId] = useState(null);

  const picksRef = useRef(null);
  const filterBarRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setAddJobOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Polls every 5s while any pick has match===null.
  // Paginates through all recommendation pages until every unscored pick
  // is found — prevents picks that sort below page-0 from staying null forever.
  // Auto-stops when all picks are scored. 10-min safety cap as fallback.
  const hasUnscoredJobs = [
    columns.picks,
    columns.saved,
    columns.applied,
    columns.interview,
    columns.offer,
  ]
    .flat()
    .some((j) => j?.match === null);

  useEffect(() => {
    if (!profileId) return;
    const unscoredIds = new Set(
      [
        ...(columns.picks || []),
        ...(columns.saved || []),
        ...(columns.applied || []),
        ...(columns.interview || []),
        ...(columns.offer || []),
      ]
        .filter((j) => j.match === null)
        .map((j) => j.id)
    );
    if (!unscoredIds.size) return;

    let safetyCount = 0;
    const interval = setInterval(async () => {
      if (++safetyCount > 120) {
        clearInterval(interval);
        return;
      }
      try {
        const scored = new Map();
        for (let page = 0; scored.size < unscoredIds.size && page < 20; page++) {
          const { data } = await _getJobsRecommendations(profileId, page, 20);
          if (!data?.jobs?.length) break;
          for (const fresh of data.jobs) {
            if (unscoredIds.has(fresh.id) && fresh.match !== null) {
              scored.set(fresh.id, fresh);
            }
          }
          if (!data.hasMore) break;
        }
        if (!scored.size) return;
        setColumns((prev) => {
          const applyScores = (jobs) =>
            (jobs || []).map((existing) => {
              const fresh = scored.get(existing.id);
              if (!fresh || existing.match !== null) return existing;
              return {
                ...existing,
                role: fresh.role || existing.role,
                company: fresh.company || existing.company,
                location: fresh.location || existing.location,
                description: fresh.description || existing.description,
                logoUrl: fresh.logoUrl || existing.logoUrl,
                match: fresh.match,
                reason: fresh.reason,
                aligns: fresh.aligns,
                gaps: fresh.gaps,
                emotionalLabel: fresh.emotionalLabel,
              };
            });
          return {
            ...prev,
            picks: applyScores(prev.picks),
            saved: applyScores(prev.saved),
            applied: applyScores(prev.applied),
            interview: applyScores(prev.interview),
            offer: applyScores(prev.offer),
          };
        });
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, hasUnscoredJobs]);

  // Targeted score poll for a job added via the share flow.
  // getRecommendations excludes pipeline jobs, so we hit getJobScore directly.
  useEffect(() => {
    if (!shareScoringJobId) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      if (++attempts > 8) {
        clearInterval(interval);
        setShareScoringJobId(null);
        return;
      }
      try {
        const { data } = await _getJobsJobScore(shareScoringJobId);
        if (data?.match !== null && data?.match !== undefined) {
          setColumns((prev) => {
            const patch = (jobs) =>
              (jobs || []).map((j) =>
                j.id === shareScoringJobId ? { ...j, match: data.match } : j
              );
            return { ...prev, saved: patch(prev.saved), applied: patch(prev.applied) };
          });
          setShareScoringJobId(null);
          clearInterval(interval);
        }
      } catch {}
    }, 2500);
    return () => clearInterval(interval);
  }, [shareScoringJobId]);

  const hasRestoredPipeline = initialColumns
    ? ["saved", "applied", "interview", "offer", "archived"].some(
        (c) => (initialColumns[c] || []).length > 0
      )
    : false;

  const [phase, setPhase] = useState(() => (hasRestoredPipeline ? "split" : "list"));

  const [centerMargin, setCenterMargin] = useState(0);
  useEffect(() => {
    const compute = () => {
      const available = window.innerWidth - 108 - 16;
      setCenterMargin(Math.max(0, Math.floor((available - 500) / 2)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (!profileId) return;
    try {
      const ids = {
        saved: (columns.saved || []).map((j) => j.id),
        applied: (columns.applied || []).map((j) => j.id),
        interview: (columns.interview || []).map((j) => j.id),
        offer: (columns.offer || []).map((j) => j.id),
        archived: (columns.archived || []).map((j) => j.id),
      };
      const hasAny = Object.values(ids).some((a) => a.length > 0);
      if (hasAny) {
        sessionStorage.setItem(`df_pipeline_${profileId}`, JSON.stringify(ids));
      } else {
        sessionStorage.removeItem(`df_pipeline_${profileId}`);
      }
    } catch {}
  }, [
    columns.saved,
    columns.applied,
    columns.interview,
    columns.offer,
    columns.archived,
    profileId,
  ]);

  const allJobs = Object.values(columns).flat();
  const allJobsRef = useRef(allJobs);
  useLayoutEffect(() => {
    allJobsRef.current = allJobs;
  });

  const filteredPicks = useMemo(() => {
    return (columns.picks || []).filter((job) => {
      if (filters.workMode !== "all" && job.workMode !== filters.workMode) return false;
      if (filters.type !== "all" && job.type !== filters.type) return false;
      if (job.match !== null && job.match < filters.minMatch) return false;
      return true;
    });
  }, [columns.picks, filters]);

  const activeFilterCount = [filters.workMode !== "all", filters.minMatch > 0].filter(
    Boolean
  ).length;

  const promptSummary = useMemo(() => {
    if (!currentAnswers.length) return "AI-matched roles for your profile";
    const parts = [
      currentAnswers[0]?.answer,
      currentAnswers[1]?.answer,
      currentAnswers[2]?.answer,
    ].filter(Boolean);
    return parts.join(" · ") || "AI-matched roles for your profile";
  }, [currentAnswers]);

  const selectedJob = selectedJobId ? (allJobs.find((j) => j.id === selectedJobId) ?? null) : null;
  const interviewJob = interviewJobId
    ? (allJobs.find((j) => j.id === interviewJobId) ?? null)
    : null;
  const roomJob = roomJobId ? (allJobs.find((j) => j.id === roomJobId) ?? null) : null;
  const scoutJob = scoutJobId ? (allJobs.find((j) => j.id === scoutJobId) ?? null) : null;
  const reportJob = reportJobId ? (allJobs.find((j) => j.id === reportJobId) ?? null) : null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleColumnsChange = useCallback(
    (newCols) => {
      Object.keys(newCols).forEach((colId) => {
        const action = COL_DRAG_ACTION[colId];
        if (!action) return;
        const prevIds = (columns[colId] || []).map((j) => j.id);
        const newIds = (newCols[colId] || []).map((j) => j.id);
        const prevSet = new Set(prevIds);
        const entered = newIds.filter((id) => !prevSet.has(id));
        entered.forEach((id) => _postJobsInteract(profileId, id, action));
        if (
          entered.length === 0 &&
          newIds.length === prevIds.length &&
          prevIds.some((id, i) => id !== newIds[i])
        ) {
          _postJobsPipelineReorder(profileId, colId, newIds);
        }
      });
      setColumns(newCols);
    },
    [columns, profileId]
  );

  const handleFetchMore = useCallback(async () => {
    if (isRescanning || rescanExhausted || !profileId) return;
    setIsRescanning(true);
    try {
      const existingNew = await findUnseenPicks(profileId, seenJobIds.current, JOB_BATCH_SIZE);
      if (existingNew.length > 0) {
        existingNew.forEach((j) => seenJobIds.current.add(j.id));
        setColumns((prev) => ({ ...prev, picks: [...(prev.picks || []), ...existingNew] }));
        return;
      }
      await _postJobsMore(profileId);
      bumpCredits();
      let resolved = false;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const { data } = await _getJobsRecommendations(profileId, 0);
        if (data.status === "ready") {
          const newJobs = await findUnseenPicks(profileId, seenJobIds.current, JOB_BATCH_SIZE);
          if (newJobs.length > 0) {
            newJobs.forEach((j) => seenJobIds.current.add(j.id));
            setColumns((prev) => ({ ...prev, picks: [...(prev.picks || []), ...newJobs] }));
          } else {
            setRescanExhausted(true);
          }
          resolved = true;
          break;
        }
        if (data.status === "exhausted") {
          setRescanExhausted(true);
          resolved = true;
          break;
        }
      }
      if (!resolved) setRescanExhausted(true);
    } catch {
    } finally {
      setIsRescanning(false);
    }
  }, [isRescanning, rescanExhausted, profileId, bumpCredits]);

  const handleRescan = useCallback(
    async (answers = currentAnswers) => {
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
        let resolved = false;
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          const { data: pollData } = await _getJobsRecommendations(newProfileId);
          if (pollData.status === "ready") {
            const newPicks = pollData.jobs || [];
            newPicks.forEach((j) => seenJobIds.current.add(j.id));
            setColumns((prev) => ({ ...prev, picks: newPicks }));
            resolved = true;
            break;
          }
          if (pollData.status === "exhausted") {
            resolved = true;
            break;
          }
        }
        if (!resolved) {
          toast.info("Still scanning in the background — check back in a minute.", {
            autoClose: 6000,
          });
        }
      } catch {
      } finally {
        setIsRescanning(false);
      }
    },
    [isRescanning, currentAnswers, bumpCredits]
  );

  const handleOpenJob = useCallback((id) => {
    const job = allJobsRef.current.find((j) => j.id === id);
    if (!job || job.match === null) return;
    setSelectedJobId(id);
  }, []);

  const dismissJoyride = useCallback(() => {
    try {
      localStorage.setItem("df_jobs_joyride_seen", "1");
    } catch {}
    setShowJoyride(false);
  }, []);

  useEffect(() => {
    if (isRescanning && showJoyride) startTransition(() => dismissJoyride());
  }, [isRescanning, showJoyride, dismissJoyride]);

  const handleShortlist = useCallback(
    (id) => {
      dismissJoyride();
      setColumns((prev) => {
        const fromCol = Object.keys(prev).find((col) => prev[col].some((j) => j.id === id));
        if (!fromCol) return prev;
        const job = prev[fromCol].find((j) => j.id === id);
        return {
          ...prev,
          [fromCol]: prev[fromCol].filter((j) => j.id !== id),
          saved: [{ ...job }, ...(prev.saved || [])],
        };
      });
      _postJobsInteract(profileId, id, "saved");

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
    [phase, centerMargin, profileId, dismissJoyride]
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
    [profileId]
  );

  const handleToggleArchive = useCallback(() => {
    setArchivedCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem("df_archived_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

  const handleJobAdded = useCallback((job) => {
    seenJobIds.current.add(job.id);
    const addedLinkedinId = extractLinkedInJobId(job.applyUrl);
    setColumns((prev) => {
      const filteredPicks = (prev.picks || []).filter((p) => {
        if (p.id === job.id) return false;
        if (job.applyUrl && p.applyUrl === job.applyUrl) return false;
        if (addedLinkedinId) {
          const pickLinkedinId = extractLinkedInJobId(p.applyUrl);
          if (pickLinkedinId && pickLinkedinId === addedLinkedinId) return false;
        }
        return true;
      });
      return {
        ...prev,
        picks: filteredPicks,
        saved: [
          { ...job, match: job.match === undefined ? null : job.match },
          ...(prev.saved || []),
        ],
      };
    });
    setPhase("split");
  }, []);

  const handleRoomEnd = useCallback(
    (transcript) => {
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
    },
    [roomJobId, profileId]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <FilterBar
        filterBarRef={filterBarRef}
        phase={phase}
        centerMargin={centerMargin}
        promptSummary={promptSummary}
        currentAnswers={currentAnswers}
        isRescanning={isRescanning}
        onRescan={handleRescan}
        filters={filters}
        onFiltersChange={setFilters}
        onFiltersReset={() => setFilters(DEFAULT_FILTERS)}
        activeFilterCount={activeFilterCount}
        filteredPicksCount={filteredPicks.length}
        totalPicksCount={(columns.picks || []).length}
        rescanExhausted={rescanExhausted}
        onAddJob={() => setAddJobOpen(true)}
        creditsRefreshKey={creditsRefreshKey}
        onBuyCredits={bumpCredits}
      />

      <DashboardColumns
        picksRef={picksRef}
        phase={phase}
        centerMargin={centerMargin}
        picksCollapsed={picksCollapsed}
        archivedCollapsed={archivedCollapsed}
        filteredPicks={filteredPicks}
        columns={columns}
        isRescanning={isRescanning}
        showJoyride={showJoyride}
        rescanExhausted={rescanExhausted}
        onColumnsChange={handleColumnsChange}
        onShortlist={handleShortlist}
        onOpenJob={handleOpenJob}
        onDismiss={handleDismiss}
        onMockInterview={handleMockInterview}
        onAskScout={setScoutJobId}
        onFetchMore={handleFetchMore}
        onTogglePicksCollapse={() => setPicksCollapsed((v) => !v)}
        onToggleArchive={handleToggleArchive}
        onOfferDecide={() => setOfferDecisionOpen(true)}
      />

      <AddJobDialog
        open={addJobOpen}
        profileId={profileId}
        onClose={() => setAddJobOpen(false)}
        onJobAdded={handleJobAdded}
      />
      <SharedJobPromptDialog
        jobId={router.query.job ?? null}
        onClose={() => router.replace("/jobs", undefined, { shallow: true })}
        onSaved={(job) => {
          if (job) {
            handleJobAdded(job);
            if (job.match === null) setShareScoringJobId(job.id);
          }
          setPhase("split");
          router.replace("/jobs", undefined, { shallow: true });
        }}
      />
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
        onStartMockInterview={
          selectedJobId
            ? () => {
                setInterviewJobId(selectedJobId);
              }
            : undefined
        }
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

      <PortalOverlays
        roomJob={roomJob}
        profileId={profileId}
        onRoomEnd={handleRoomEnd}
        reportJob={reportJob}
        completedReports={completedReports}
        reportLoading={reportLoading}
        onReportClose={() => setReportJobId(null)}
        viewingReport={viewingReport}
        onViewingReportClose={() => setViewingReport(null)}
        scoutJob={scoutJob}
        onScoutClose={() => setScoutJobId(null)}
        offerDecisionOpen={offerDecisionOpen}
        offerJobs={columns.offer || []}
        onOfferClose={() => setOfferDecisionOpen(false)}
        onCreditUsed={bumpCredits}
      />
    </motion.div>
  );
}
