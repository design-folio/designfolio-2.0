import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { TransitionScreen } from "./TransitionScreen";
import { TypeRoom } from "./TypeRoom";
import { ThinkingScreen } from "./ThinkingScreen";
import { AhaMomentModal } from "./AhaMomentModal";
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
 *         → thinking        (POST /jobs/recommend in-flight)
 *           → aha           (celebration modal)
 *             → dashboard   (kanban board)
 *
 * Error states: 'empty' (404 from recommend), 'error' (unexpected)
 */
export function Jobs() {
  const [phase, setPhase] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recommendationId, setRecommendationId] = useState(null);
  // null = no history yet (build fresh from jobs); object = restored column state
  const [initialColumns, setInitialColumns] = useState(null);
  // Quiz answers for Criteria panel — populated from history or new search
  const [quizAnswers, setQuizAnswers] = useState([]);

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
          jobs: historyJobs = [],
          recommendationId: historyRecId,
          columns: historyColumns,
          quizAnswers: historyQuizAnswers,
        } = historyRes.data;

        setQuestions(fetchedQuestions);

        if (historyJobs.length > 0) {
          setJobs(historyJobs);
          setRecommendationId(historyRecId ?? null);

          // Restore board column state from persisted pipeline
          if (historyColumns) {
            // Map string IDs → full job objects for each column
            const jobMap = Object.fromEntries(historyJobs.map((j) => [j.id, j]));
            const restored = {
              picks:       (historyColumns.picks       || []).map((id) => jobMap[id]).filter(Boolean),
              not_applied: (historyColumns.not_applied || []).map((id) => jobMap[id]).filter(Boolean),
              applied:     (historyColumns.applied     || []).map((id) => jobMap[id]).filter(Boolean),
              interview:   (historyColumns.interview   || []).map((id) => jobMap[id]).filter(Boolean),
              offer:       (historyColumns.offer       || []).map((id) => jobMap[id]).filter(Boolean),
            };

            // Any job that isn't placed in any column defaults to picks.
            // This handles pipeline gaps (e.g. jobs added after column state was saved,
            // or ID mismatches between pipeline and jobs array).
            const placedIds = new Set(
              Object.values(restored).flat().map((j) => j.id),
            );
            const unplaced = historyJobs.filter((j) => !placedIds.has(j.id));
            if (unplaced.length) restored.picks = [...restored.picks, ...unplaced];

            // Only use restored columns if the pipeline was actually persisted.
            // For old recommendations without a pipeline field the backend returns
            // all-empty column arrays — in that case fall back to putting all
            // jobs in picks so the board isn't blank.
            const hasPipelineData = Object.values(restored).some((col) => col.length > 0);
            setInitialColumns(hasPipelineData ? restored : null);
          }

          if (historyQuizAnswers?.length) setQuizAnswers(historyQuizAnswers);
          setPhase("dashboard");
        } else {
          setPhase("transition");
        }
      } catch {
        setPhase("error");
      }
    };

    init();
  }, []);

  const handleDone = (collectedAnswers) => {
    setAnswers(collectedAnswers);
    setPhase("thinking");
  };

  const handleRecommendComplete = (fetchedJobs, recId) => {
    setJobs(fetchedJobs);
    setRecommendationId(recId);
    setQuizAnswers(answers);
    setPhase("aha");
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
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-[#F0EDE7] dark:bg-background">
        <p className="text-foreground/60 text-sm">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-foreground underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty (404 from recommend) ──────────────────────────────────────────
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

      {/* Dashboard lives behind the aha modal */}
      {(phase === "aha" || phase === "dashboard") && (
        <Dashboard
          initialJobs={jobs}
          initialColumns={initialColumns}
          recommendationId={recommendationId}
          quizAnswers={quizAnswers}
        />
      )}

      <AnimatePresence>
        {phase === "aha" && (
          <AhaMomentModal
            jobCount={jobs.length}
            answers={answers}
            onConfirm={() => setPhase("dashboard")}
          />
        )}
      </AnimatePresence>
    </>
  );
}
