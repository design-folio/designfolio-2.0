import { useState, useEffect, useRef, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { _postJobsRecommend, _getJobsRecommendations } from "@/network/jobs";
import { ColorOrb } from "@/components/ui/color-orb";

// Calls POST /jobs/recommend — returns immediately with { profileId, status: "processing" }.
// Then polls GET /jobs/recommendations every 3s until status === "ready".
// Visual animation (timeline) runs in parallel — steps reveal via timers,
// portfolio/rank steps gate on real data resolving.

const keyframes = `
  @keyframes thinking-pulse {
    0%, 100% { opacity: 0.5; transform: scale(0.85); }
    50%       { opacity: 1;   transform: scale(1.15); }
  }
  @keyframes heading-fade {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
`;

export function ThinkingScreen({ answers, onComplete, onError }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [liStatus, setLiStatus] = useState("waiting");
  const [liCount, setLiCount] = useState(undefined);
  const [indeedStatus, setIndeedStatus] = useState("waiting");

  const timersRef = useRef([]);
  const pollRef = useRef(null);

  const addTimer = (id) => timersRef.current.push(id);
  const clearAll = () => {
    timersRef.current.forEach(clearTimeout);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  // Tick the elapsed timer
  useEffect(() => {
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Advance timeline steps 4+5 when real data resolves
  useEffect(() => {
    if (liStatus !== "done") return;
    startTransition(() => setVisibleCount((v) => Math.max(v, 5)));
    const t = setTimeout(() => startTransition(() => setVisibleCount((v) => Math.max(v, 6))), 600);
    return () => clearTimeout(t);
  }, [liStatus]);

  useEffect(() => {
    let done = false;

    // Visual step reveals — independent of polling timing
    addTimer(setTimeout(() => setVisibleCount(1), 350));
    addTimer(setTimeout(() => setVisibleCount(2), 1000));
    addTimer(
      setTimeout(() => {
        setLiStatus("scraping");
        setVisibleCount(3);
      }, 1800)
    );
    addTimer(
      setTimeout(() => {
        setIndeedStatus("scraping");
        setVisibleCount(4);
      }, 3000)
    );

    const run = async () => {
      try {
        const { data } = await _postJobsRecommend(answers);
        if (done) return;

        const profileId = data.profileId;
        let attempts = 0;

        pollRef.current = setInterval(async () => {
          if (done) {
            clearInterval(pollRef.current);
            return;
          }

          attempts++;
          if (attempts > 30) {
            clearInterval(pollRef.current);
            done = true;
            clearAll();
            onError(false);
            return;
          }

          try {
            const { data: pollData } = await _getJobsRecommendations(profileId);
            if (pollData.status === "ready") {
              clearInterval(pollRef.current);
              done = true;
              if ((pollData.jobs?.length ?? 0) > 0) {
                const total = pollData.jobs.length;
                setLiStatus("done");
                setLiCount(total);
                setIndeedStatus("done");
                addTimer(setTimeout(() => onComplete(pollData.jobs, profileId), 1600));
              } else {
                clearAll();
                onError(true);
              }
            } else if (pollData.status === "exhausted") {
              clearInterval(pollRef.current);
              done = true;
              clearAll();
              onError(true);
            }
          } catch {
            // ignore transient poll errors
          }
        }, 3000);
      } catch (err) {
        if (done) return;
        done = true;
        clearAll();
        const status = err?.response?.status;
        onError(status === 404);
      }
    };

    run();

    return () => {
      done = true;
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    { label: "Reading your answers" },
    { label: "Filtering for matching roles" },
    {
      label: "Scanning LinkedIn",
      getDetail: () =>
        liStatus === "done"
          ? `${liCount} roles found`
          : liStatus === "scraping"
            ? "scanning…"
            : null,
      isScanning: liStatus === "scraping",
    },
    {
      label: "Scanning Indeed",
      getDetail: () =>
        indeedStatus === "done" ? "indexed" : indeedStatus === "scraping" ? "scanning…" : null,
      isScanning: indeedStatus === "scraping",
    },
    { label: "Cross-referencing your portfolio" },
    { label: "Ranking by alignment score" },
  ];

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <style>{keyframes}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[380px] rounded-full dark:bg-[#FF553E]/6 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-xs flex flex-col gap-8">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex gap-[4px]">
                <span className="orb-spinning">
                  <ColorOrb dimension="18px" spinDuration={4} />
                </span>
              </div>
              <p
                className="text-[18px] font-semibold tracking-tight text-foreground"
                style={{ animation: "heading-fade 2.8s ease-in-out infinite" }}
              >
                Finding your matches
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground/50 leading-snug">
              Matching roles to your portfolio and preferences
            </p>
          </div>
          <span className="text-[12px] text-muted-foreground/35 font-mono tabular-nums mt-0.5 shrink-0">
            {timer}s
          </span>
        </motion.div>

        {/* Timeline */}
        <div className="flex flex-col">
          {steps.map((step, i) => {
            if (i >= visibleCount) return null;
            const isActive = i === visibleCount - 1;
            const isDone = i < visibleCount - 1;
            const isLast = i === steps.length - 1;
            const detail = step.getDetail?.() ?? null;
            const isScanning = step.isScanning;

            return (
              <motion.div
                key={i}
                className="flex gap-3.5"
                initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Dot + vertical connector */}
                <div className="flex flex-col items-center shrink-0" style={{ width: 16 }}>
                  <div
                    className="relative flex items-center justify-center"
                    style={{ width: 16, height: 16 }}
                  >
                    {isActive ? (
                      <>
                        <motion.div
                          className="absolute rounded-full border border-[#FF553E]/40"
                          style={{ width: 14, height: 14 }}
                          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-[#FF553E]"
                          style={{ animation: "thinking-pulse 1.4s ease-in-out infinite" }}
                        />
                      </>
                    ) : (
                      <div
                        className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                        style={{
                          background: isDone
                            ? "hsl(var(--muted-foreground) / 0.35)"
                            : "hsl(var(--border))",
                        }}
                      />
                    )}
                  </div>
                  {!isLast && (
                    <motion.div
                      className="w-px"
                      style={{
                        height: 28,
                        background: isDone
                          ? "linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.2), hsl(var(--muted-foreground) / 0.1))"
                          : "linear-gradient(to bottom, hsl(var(--border) / 0.5), transparent)",
                      }}
                      initial={{ scaleY: 0, originY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    />
                  )}
                </div>

                {/* Step text */}
                <div
                  className={`${isLast ? "pb-0" : "pb-1"} flex flex-col gap-0.5`}
                  style={{ paddingTop: 1 }}
                >
                  <p
                    className="text-[13.5px] leading-snug transition-colors duration-500"
                    style={{
                      color: isActive
                        ? "hsl(var(--foreground))"
                        : isDone
                          ? "hsl(var(--muted-foreground) / 0.55)"
                          : "hsl(var(--foreground))",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </p>

                  <AnimatePresence mode="wait">
                    {detail && (
                      <motion.p
                        key={detail}
                        className="text-[11.5px]"
                        style={{
                          color:
                            detail.includes("found") || detail === "indexed"
                              ? "hsl(142 60% 42%)"
                              : "hsl(var(--muted-foreground) / 0.5)",
                        }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {isScanning && !detail.includes("found") && (
                          <span className="inline-flex gap-[3px] items-center mr-1">
                            {[0, 1, 2].map((j) => (
                              <motion.span
                                key={j}
                                className="inline-block w-[3px] h-[3px] rounded-full bg-current"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 0.9, repeat: Infinity, delay: j * 0.2 }}
                              />
                            ))}
                          </span>
                        )}
                        {detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
