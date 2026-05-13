import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { TransitionScreen } from "./TransitionScreen";
import { TypeRoom } from "./TypeRoom";
import { ThinkingScreen } from "./ThinkingScreen";
import { Dashboard } from "./Dashboard";
import { _getJobsQuestions, _getJobsHistory } from "@/network/jobs";

/**
 * Jobs — root phase state machine
 *
 * Flow:
 *   loading → (history check)
 *     → dashboard           if history has jobs
 *     → transition          if no history
 *       → type
 *         → thinking        (POST /jobs/recommend → poll until ready)
 *           → aha           (celebration modal)
 *             → dashboard   (kanban board)
 *
 * Error states: 'empty' (no jobs found), 'error' (unexpected)
 */
export function Jobs() {
  const [phase,          setPhase]          = useState("loading");
  const [errorType,      setErrorType]      = useState(null); // "auth" | "generic"
  const [questions,      setQuestions]      = useState([]);
  const [answers,        setAnswers]        = useState([]);
  const [jobs,           setJobs]           = useState([]);
  const [profileId,      setProfileId]      = useState(null);
  // null = no history yet (build fresh from jobs); object = restored column state
  const [initialColumns, setInitialColumns] = useState(null);
  // Quiz answers for Criteria panel — populated from history or new search
  const [quizAnswers,    setQuizAnswers]    = useState([]);

  // On mount: parallel fetch questions + history
  useEffect(() => {
    const init = async () => {
      try {
        const [questionsRes, historyRes] = await Promise.all([
          _getJobsQuestions(),
          _getJobsHistory(),
        ]);

        const fetchedQuestions = questionsRes.data.questions ?? [];
        const {
          jobs:        historyJobs       = [],
          profileId:   historyProfileId,
          columns:     historyColumns,
          quizAnswers: historyQuizAnswers,
        } = historyRes.data;

        setQuestions(fetchedQuestions);

        if (historyJobs.length > 0) {
          setJobs(historyJobs);
          setProfileId(historyProfileId ?? null);

          // Restore board column state: prefer backend response, fall back to
          // sessionStorage (written by Dashboard on every column change).
          const columnsSource = historyColumns || (() => {
            try {
              const stored = sessionStorage.getItem(`df_pipeline_${historyProfileId}`);
              return stored ? JSON.parse(stored) : null;
            } catch { return null; }
          })();

          if (columnsSource) {
            const jobMap = Object.fromEntries(historyJobs.map((j) => [j.id, j]));
            const restored = {
              picks:     [],
              saved:     (columnsSource.saved     || []).map((id) => jobMap[id]).filter(Boolean),
              applied:   (columnsSource.applied   || []).map((id) => jobMap[id]).filter(Boolean),
              interview: (columnsSource.interview || []).map((id) => jobMap[id]).filter(Boolean),
              offer:     (columnsSource.offer     || []).map((id) => jobMap[id]).filter(Boolean),
              archived:  (columnsSource.archived  || []).map((id) => jobMap[id]).filter(Boolean),
            };

            // Unplaced jobs (not in any pipeline column) go to picks
            const placedIds = new Set(
              Object.values(restored).flat().map((j) => j.id),
            );
            restored.picks = historyJobs.filter((j) => !placedIds.has(j.id));

            const hasPipelineData = ['saved','applied','interview','offer','archived']
              .some((c) => restored[c].length > 0);
            setInitialColumns(hasPipelineData ? restored : null);
          }

          if (historyQuizAnswers?.length) setQuizAnswers(historyQuizAnswers);
          setPhase("dashboard");
        } else {
          setPhase("transition");
        }
      } catch (err) {
        const is401 = err?.response?.status === 401 || err?.status === 401;
        setErrorType(is401 ? "auth" : "generic");
        setPhase("error");
      }
    };

    init();
  }, []);

  const handleDone = (collectedAnswers) => {
    setAnswers(collectedAnswers);
    setPhase("thinking");
  };

  const handleRecommendComplete = (fetchedJobs, pid) => {
    setJobs(fetchedJobs);
    setProfileId(pid);
    setQuizAnswers(answers);
    setPhase("dashboard");
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F0EDE7] dark:bg-background">
        <div className="flex gap-[5px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#FF553E] animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (phase === "error") {
    const isAuth = errorType === "auth";
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-[#F0EDE7] dark:bg-background px-6">
        <p className="text-foreground text-[18px] font-medium tracking-tight text-center">
          {isAuth ? "Session expired" : "Something went wrong"}
        </p>
        <p className="text-foreground/50 text-sm max-w-xs text-center leading-relaxed">
          {isAuth
            ? "Your session has expired or you're not signed in. Please log in to continue."
            : "We couldn't load your jobs. Please try again."}
        </p>
        <button
          onClick={() => {
            if (isAuth) {
              Cookies.remove("df-token", { domain: process.env.NEXT_PUBLIC_BASE_DOMAIN });
              localStorage.removeItem("bottom_notification_seen");
              window.location.href = "/login";
            } else {
              window.location.reload();
            }
          }}
          className="mt-2 h-10 px-6 rounded-full bg-foreground text-background text-sm font-medium"
        >
          {isAuth ? "Sign in" : "Retry"}
        </button>
      </div>
    );
  }

  // ── Empty (no jobs found) ─────────────────────────────────────────────────
  if (phase === "empty") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-[#F0EDE7] dark:bg-background px-6">
        <p className="text-foreground text-[22px] font-medium tracking-tight text-center">
          No matching roles found.
        </p>
        <p className="text-foreground/50 text-sm max-w-xs text-center leading-relaxed">
          We couldn&apos;t find jobs for your location or preferences right now.
          Try different answers.
        </p>
        <button
          onClick={() => {
            setAnswers([]);
            setPhase("transition");
          }}
          className="mt-2 h-10 px-6 rounded-full bg-foreground text-background text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "transition" && (
          <TransitionScreen
            key="transition"
            onType={() => setPhase("type")}
          />
        )}
        {phase === "type" && (
          <TypeRoom
            key="type"
            questions={questions}
            onDone={handleDone}
            onReset={() => setPhase("transition")}
          />
        )}
        {phase === "thinking" && (
          <ThinkingScreen
            key="thinking"
            answers={answers}
            onComplete={handleRecommendComplete}
            onError={(is404) => setPhase(is404 ? "empty" : "error")}
          />
        )}
      </AnimatePresence>

      {phase === "dashboard" && (
        <Dashboard
          initialJobs={jobs}
          initialColumns={initialColumns}
          profileId={profileId}
          quizAnswers={quizAnswers}
        />
      )}
    </>
  );
}
