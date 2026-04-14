import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LinkedInLogo, IndeedLogo } from "./PlatformLogos";
import { _postJobsRecommend } from "@/network/jobs";

// Calls POST /jobs/recommend with the user's answers.
// The API takes 5–15 seconds (live job fetching + AI scoring).
// Visual animation runs in parallel — platforms animate independently.
// When the API resolves, both show "done" then onComplete is called.

function ThoughtLine({ text, delay, dim }) {
  return (
    <motion.div
      className={`flex items-start gap-2 text-[13px] leading-relaxed font-mono ${
        dim ? "text-muted-foreground/40" : "text-muted-foreground"
      }`}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
    >
      <span className="text-foreground/20 mt-0.5 flex-shrink-0">›</span>
      <span>{text}</span>
    </motion.div>
  );
}

function PlatformCard({ logo, name, status, count, delay }) {
  return (
    <motion.div
      className="flex-1 min-w-0 border border-black/8 dark:border-border rounded-2xl p-4 flex flex-col gap-3 bg-white dark:bg-muted/30"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-center gap-2">
        {logo}
        <span className="text-foreground/70 text-[13px] font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        {status === "waiting" && (
          <span className="text-muted-foreground/50 text-[12px]">Queued</span>
        )}
        {status === "scraping" && (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-[3px]">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-[#FF553E]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-[#FF553E] text-[12px]">Scanning…</span>
          </div>
        )}
        {status === "done" && (
          <motion.div
            className="flex items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 0.4 }}
            />
            <span className="text-emerald-500 text-[12px]">
              {count != null ? `${count} roles found` : "Done"}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function ThinkingScreen({ answers, onComplete, onError }) {
  const thoughts = [
    { text: "Reading your answers…", delay: 0.3 },
    { text: "Extracting role and location signals.", delay: 0.85 },
    { text: "Filtering for employment type match.", delay: 1.4 },
    { text: "Excluding mismatched listings.", delay: 1.95 },
    { text: "Weighting for portfolio alignment.", delay: 2.5 },
    { text: "Running vector search on job embeddings…", delay: 3.1 },
    { text: "Scoring each role with Gemini…", delay: 3.7 },
  ];

  const [liStatus, setLiStatus] = useState("waiting");
  const [liCount, setLiCount] = useState(undefined);
  const [indeedStatus, setIndeedStatus] = useState("waiting");
  const [indeedCount, setIndeedCount] = useState(undefined);
  const [isExpanded, setIsExpanded] = useState(true);

  // Track timers for cleanup
  const timersRef = useRef([]);
  const addTimer = (id) => timersRef.current.push(id);
  const clearAll = () => timersRef.current.forEach(clearTimeout);

  useEffect(() => {
    let done = false;

    // Visual animation — independent of API timing
    addTimer(setTimeout(() => setLiStatus("scraping"), 1800));
    addTimer(setTimeout(() => setIndeedStatus("scraping"), 3000));

    // Real API call
    const run = async () => {
      try {
        const { data } = await _postJobsRecommend(answers);
        if (done) return;
        done = true;

        const total = data.jobs?.length ?? 0;
        setLiStatus("done");
        setLiCount(total);
        setIndeedStatus("done");
        setIndeedCount(0); // JSearch is the real source; visual parity only

        // Short pause to let the user see the "done" state before advancing
        addTimer(setTimeout(() => onComplete(data.jobs, data.pipelineId), 1200));
      } catch (err) {
        if (done) return;
        done = true;
        clearAll();
        onError(err?.response?.status === 404);
      }
    };

    run();

    return () => {
      done = true;
      clearAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#F0EDE7] dark:bg-background px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full dark:bg-[#FF553E]/7 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col gap-5">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex gap-[5px] items-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#FF553E]"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.2, 0.9] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}
          </div>
          <h2 className="text-foreground text-[17px] font-semibold tracking-tight">
            Got it. We&apos;re on it.
          </h2>
        </motion.div>

        <motion.div
          className="border border-black/8 dark:border-border rounded-2xl overflow-hidden bg-white dark:bg-muted/20"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-black/8 dark:border-border hover:bg-black/[0.03] dark:hover:bg-muted/30 transition-colors"
            data-testid="button-thinking-toggle"
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="text-muted-foreground text-[12px] font-medium tracking-wide uppercase">
                Thinking
              </span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.25 }}
              className="text-foreground/20"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="px-4 py-3 flex flex-col gap-2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {thoughts.map((t, i) => (
                  <ThoughtLine
                    key={i}
                    text={t.text}
                    delay={t.delay}
                    dim={i < thoughts.length - 2}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <PlatformCard
            logo={<LinkedInLogo size={22} />}
            name="LinkedIn"
            status={liStatus}
            count={liCount}
            delay={0.4}
          />
          <PlatformCard
            logo={<IndeedLogo size={22} />}
            name="Indeed"
            status={indeedStatus}
            count={indeedCount}
            delay={0.55}
          />
        </motion.div>

        <motion.p
          className="text-muted-foreground/50 text-[12px] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Matching roles to your portfolio and preferences
        </motion.p>
      </div>
    </motion.div>
  );
}
