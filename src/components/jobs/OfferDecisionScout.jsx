import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Maximize2, Minimize2, SendHorizontal, ArrowRight } from "lucide-react";
import { ColorOrb } from "@/components/ui/color-orb";
import { _postJobsOfferDecision } from "@/network/jobs";

const REGRET_SUGGESTIONS = [
  "Money short-term",
  "Career growth",
  "Work environment",
  "Job security",
];

const buildSteps = (compA, compB) => [
  { key: "ctc", q: "What's your current CTC?" },
  {
    key: "offerA",
    q: `Let's figure this out. What's ${compA} actually offering — base salary and anything else on top?`,
  },
  { key: "offerB", q: `Got it. And ${compB}?` },
  {
    key: "feel",
    q: "Now the part the numbers can't tell me — how did each interview actually feel?",
  },
  {
    key: "regret",
    q: "Last one. What's the thing you'd most regret optimising for the wrong way?",
    suggestions: REGRET_SUGGESTIONS,
  },
];

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="flex h-5 items-center gap-[5px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-current"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

// ── Thinking loader shown while API is in-flight ──────────────────────────────
function ThinkingLoader({ compA, compB }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10"
    >
      <motion.div
        className="orb-always-active"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ColorOrb dimension="44px" spinDuration={4} />
      </motion.div>
      <div className="space-y-1.5 text-center">
        <p className="text-foreground/75 text-[14px] font-medium">
          Weighing {compA} vs {compB}
        </p>
        <p className="text-foreground/40 text-[12px] leading-relaxed">
          Scout is reviewing your answers and both JDs
        </p>
      </div>
      <div className="mt-1 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="bg-foreground/25 h-1 w-1 rounded-full"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ winner, analysis, regretNote, take }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Scout's Take label */}
      <div className="mb-3 flex items-center gap-2 px-0.5">
        <span className="orb-spinning">
          <ColorOrb dimension="14px" spinDuration={5} />
        </span>
        <span className="text-foreground/45 text-[11px] font-semibold tracking-widest uppercase">
          Scout&apos;s Take
        </span>
      </div>

      {/* Winner block — the centrepiece */}
      <div className="dark:bg-card dark:border-border mb-3 overflow-hidden rounded-xl border border-black/[0.07] bg-white">
        <div className="px-4 pt-4 pb-3">
          <p className="text-foreground/40 mb-1.5 text-[11px] font-medium tracking-wider uppercase">
            Lean toward
          </p>
          <div className="flex items-center justify-between">
            <p className="text-foreground text-[22px] leading-tight font-bold tracking-tight">
              {winner}
            </p>
            <div className="bg-foreground/[0.06] flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
              <ArrowRight className="text-foreground/50 h-3.5 w-3.5" />
            </div>
          </div>
        </div>
        {/* Warm accent rule */}
        <div className="h-[2px] bg-gradient-to-r from-[#FF553E]/30 via-[#FF553E]/10 to-transparent" />
      </div>

      {/* Analysis + regret note */}
      <div className="dark:bg-card dark:border-border mb-3 space-y-3 rounded-xl border border-black/[0.07] bg-white px-4 py-4">
        <p className="text-foreground/75 text-[13.5px] leading-[1.65]">{analysis}</p>
        {regretNote && (
          <>
            <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />
            <p className="text-foreground/55 text-[13px] leading-[1.6] italic">{regretNote}</p>
          </>
        )}
      </div>

      {/* Final take */}
      <div className="bg-foreground/[0.04] rounded-xl border border-black/[0.06] px-4 py-3.5 dark:border-white/[0.06] dark:bg-white/[0.04]">
        <p className="text-foreground/85 text-[13.5px] leading-[1.65] font-medium">{take}</p>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function OfferDecisionScout({ jobs, profileId, onClose, onCreditUsed }) {
  const compA = jobs[0]?.company ?? "Company A";
  const compB = jobs[1]?.company ?? "Company B";
  const jobAId = jobs[0]?.id;
  const jobBId = jobs[1]?.id;
  const steps = buildSteps(compA, compB);

  const [messages, setMessages] = useState([{ role: "ai", text: steps[0].q }]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const done = result !== null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const cur = steps[step];
    const newAnswers = { ...answers, [cur.key]: trimmed };
    setAnswers(newAnswers);
    setInput("");

    const next = step + 1;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);

    if (next >= steps.length) {
      setLoading(true);
      try {
        const { data } = await _postJobsOfferDecision(profileId, jobAId, jobBId, newAnswers);
        onCreditUsed?.();
        setResult(data);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Something went wrong. Please close and try again." },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "ai", text: steps[next].q }]);
        setStep(next);
        setTimeout(() => inputRef.current?.focus(), 80);
      }, 120);
    }
  };

  const curStep = steps[step];
  const hasSuggestions = !done && !loading && "suggestions" in curStep;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[200]">
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{
          layout: { type: "spring", bounce: 0.15, duration: 0.5 },
          opacity: { duration: 0.22 },
          y: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.22 },
        }}
        className={`pointer-events-auto absolute flex flex-col overflow-hidden rounded-2xl border border-black/[0.1] bg-[#F5F2EE] shadow-2xl dark:border-white/[0.1] dark:bg-[#161412] ${
          expanded
            ? "inset-x-0 inset-y-[5%] mx-auto w-full max-w-[600px]"
            : "right-4 bottom-4 h-[560px] w-[390px]"
        }`}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-black/[0.07] bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="orb-spinning">
              <ColorOrb dimension="14px" spinDuration={6} />
            </span>
            <span className="text-foreground text-[13.5px] font-semibold">Scout</span>
            <span className="text-foreground/40 truncate text-[12px]">
              · {compA} vs {compB}
            </span>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-0.5">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Collapse" : "Expand"}
              className="text-foreground/35 hover:text-foreground/70 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]"
            >
              {expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-foreground/35 hover:text-foreground/70 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Progress bar ──────────────────────────────────────────────────── */}
        {!done && (
          <div className="flex shrink-0 items-center gap-[3px] px-4 pt-3 pb-0">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/[0.08]"
              >
                <motion.div
                  className="bg-foreground/50 h-full rounded-full"
                  initial={{ width: i < step ? "100%" : i === step ? "0%" : "0%" }}
                  animate={{ width: i < step ? "100%" : i === step ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="thinking"
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ThinkingLoader compA={compA} compB={compB} />
            </motion.div>
          ) : done ? (
            <motion.div
              key="result"
              className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-4"
              style={{ scrollbarWidth: "none" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ResultCard {...result} />
              <div ref={bottomRef} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 pt-3 pb-2"
              style={{ scrollbarWidth: "none" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {messages.map((msg, i) => {
                const isLastAi =
                  msg.role === "ai" && messages.slice(i + 1).every((m) => m.role !== "ai");
                return (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "ai" && (
                      <div className="mb-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                        {isLastAi ? (
                          <span className="orb-spinning">
                            <ColorOrb dimension="18px" spinDuration={5} />
                          </span>
                        ) : (
                          <div className="border-foreground/20 h-[16px] w-[16px] rounded-full border-[1.5px] border-dashed" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-[1.65] ${
                        msg.role === "user"
                          ? "rounded-br-sm bg-[#1C1C1C] text-white dark:bg-white dark:text-[#141414]"
                          : "text-foreground/85 rounded-bl-sm border border-black/[0.07] bg-white shadow-sm dark:border-white/[0.09] dark:bg-white/[0.07]"
                      }`}
                    >
                      {msg.text ?? <TypingDots />}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-black/[0.07] bg-white/40 dark:border-white/[0.08] dark:bg-white/[0.02]">
          {done ? (
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="text-foreground/35 text-[11px]">AI-powered</p>
              <button
                onClick={onClose}
                className="bg-foreground text-background h-8 cursor-pointer rounded-full px-5 text-[12.5px] font-medium transition-opacity hover:opacity-80"
              >
                Done
              </button>
            </div>
          ) : hasSuggestions ? (
            <div className="flex flex-col items-end gap-1.5 px-3 py-3">
              {curStep.suggestions.map((s, i) => (
                <motion.button
                  key={s}
                  onClick={() => submit(s)}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="text-foreground/70 hover:text-foreground hover:border-foreground/20 cursor-pointer rounded-2xl border border-black/[0.08] bg-white px-4 py-2 text-[13px] shadow-sm transition-colors dark:border-white/[0.1] dark:bg-white/[0.07]"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          ) : !loading ? (
            <div className="px-3 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 py-2.5 shadow-sm dark:border-white/[0.1] dark:bg-white/[0.06]">
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit(input);
                  }}
                  placeholder="Type your answer…"
                  className="text-foreground placeholder:text-foreground/30 flex-1 bg-transparent text-[13.5px] outline-none"
                />
                <button
                  onClick={() => submit(input)}
                  disabled={!input.trim()}
                  className="bg-foreground flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity disabled:opacity-20"
                >
                  <SendHorizontal className="text-background h-3.5 w-3.5" />
                </button>
              </div>
              {step === steps.length - 1 && (
                <p className="text-foreground/30 mt-2 text-center text-[11px]">
                  Scout will analyse both offers
                </p>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
