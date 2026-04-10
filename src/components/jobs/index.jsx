import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { TransitionScreen } from "./TransitionScreen";
import { VoiceRoom } from "./VoiceRoom";
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
 *       → voice | type
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

  // On mount: parallel fetch questions + history
  useEffect(() => {
    const init = async () => {
      try {
        const [questionsRes, historyRes] = await Promise.all([
          _getJobsQuestions(),
          _getJobsHistory(),
        ]);

        const fetchedQuestions = questionsRes.data.questions ?? [];
        const { jobs: historyJobs = [], recommendationId: historyRecId } =
          historyRes.data;

        setQuestions(fetchedQuestions);

        if (historyJobs.length > 0) {
          setJobs(historyJobs);
          setRecommendationId(historyRecId ?? null);
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
            onVoice={() => setPhase("voice")}
            onType={() => setPhase("type")}
          />
        )}
        {phase === "voice" && (
          <VoiceRoom
            key="voice"
            questions={questions}
            onDone={handleDone}
            onReset={() => setPhase("type")}
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
        <Dashboard initialJobs={jobs} recommendationId={recommendationId} />
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
