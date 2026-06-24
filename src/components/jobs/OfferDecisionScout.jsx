import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <span className="flex gap-[5px] items-center h-5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[5px] h-[5px] rounded-full bg-current"
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
      className="flex flex-col items-center justify-center gap-5 flex-1 px-6 py-10"
    >
      <motion.div
        className="orb-always-active"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ColorOrb dimension="44px" spinDuration={4} />
      </motion.div>
      <div className="text-center space-y-1.5">
        <p className="text-[14px] font-medium text-foreground/75">
          Weighing {compA} vs {compB}
        </p>
        <p className="text-[12px] text-foreground/40 leading-relaxed">
          Scout is reviewing your answers and both JDs
        </p>
      </div>
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-foreground/25"
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
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <span className="orb-spinning">
          <ColorOrb dimension="14px" spinDuration={5} />
        </span>
        <span className="text-[11px] font-semibold tracking-widest text-foreground/45 uppercase">
          Scout&apos;s Take
        </span>
      </div>

      {/* Winner block — the centrepiece */}
      <div className="bg-white dark:bg-card rounded-xl border border-black/[0.07] dark:border-border overflow-hidden mb-3">
        <div className="px-4 pt-4 pb-3">
          <p className="text-[11px] text-foreground/40 mb-1.5 uppercase tracking-wider font-medium">
            Lean toward
          </p>
          <div className="flex items-center justify-between">
            <p className="text-[22px] font-bold text-foreground leading-tight tracking-tight">
              {winner}
            </p>
            <div className="w-7 h-7 rounded-full bg-foreground/[0.06] flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-3.5 h-3.5 text-foreground/50" />
            </div>
          </div>
        </div>
        {/* Warm accent rule */}
        <div className="h-[2px] bg-gradient-to-r from-[#FF553E]/30 via-[#FF553E]/10 to-transparent" />
      </div>

      {/* Analysis + regret note */}
      <div className="bg-white dark:bg-card rounded-xl border border-black/[0.07] dark:border-border px-4 py-4 mb-3 space-y-3">
        <p className="text-[13.5px] text-foreground/75 leading-[1.65]">{analysis}</p>
        {regretNote && (
          <>
            <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />
            <p className="text-[13px] text-foreground/55 leading-[1.6] italic">{regretNote}</p>
          </>
        )}
      </div>

      {/* Final take */}
      <div className="bg-foreground/[0.04] dark:bg-white/[0.04] rounded-xl border border-black/[0.06] dark:border-white/[0.06] px-4 py-3.5">
        <p className="text-[13.5px] font-medium text-foreground/85 leading-[1.65]">{take}</p>
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
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-auto"
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
        className={`absolute pointer-events-auto flex flex-col bg-[#F5F2EE] dark:bg-[#161412] border border-black/[0.1] dark:border-white/[0.1] shadow-2xl rounded-2xl overflow-hidden ${
          expanded
            ? "inset-y-[5%] inset-x-0 mx-auto w-full max-w-[600px]"
            : "bottom-4 right-4 w-[390px] h-[560px]"
        }`}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white/60 dark:bg-white/[0.04] border-b border-black/[0.07] dark:border-white/[0.08] backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="orb-spinning">
              <ColorOrb dimension="14px" spinDuration={6} />
            </span>
            <span className="text-[13.5px] font-semibold text-foreground">Scout</span>
            <span className="text-[12px] text-foreground/40 truncate">
              · {compA} vs {compB}
            </span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Collapse" : "Expand"}
              className="w-7 h-7 flex items-center justify-center rounded-md text-foreground/35 hover:text-foreground/70 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors cursor-pointer"
            >
              {expanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 flex items-center justify-center rounded-md text-foreground/35 hover:text-foreground/70 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Progress bar ──────────────────────────────────────────────────── */}
        {!done && (
          <div className="flex-shrink-0 flex items-center gap-[3px] px-4 pt-3 pb-0">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className="h-[3px] flex-1 rounded-full overflow-hidden bg-black/[0.08] dark:bg-white/[0.08]"
              >
                <motion.div
                  className="h-full rounded-full bg-foreground/50"
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
              className="flex-1 flex flex-col min-h-0"
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
              className="flex-1 overflow-y-auto px-4 pt-4 pb-4 min-h-0"
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
              className="flex-1 overflow-y-auto px-4 pt-3 pb-2 min-h-0 space-y-2.5"
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
                      <div className="flex-shrink-0 mb-0.5 w-5 h-5 flex items-center justify-center">
                        {isLastAi ? (
                          <span className="orb-spinning">
                            <ColorOrb dimension="18px" spinDuration={5} />
                          </span>
                        ) : (
                          <div className="w-[16px] h-[16px] rounded-full border-[1.5px] border-dashed border-foreground/20" />
                        )}
                      </div>
                    )}
                    <div
                      className={`text-[13.5px] leading-[1.65] rounded-2xl px-3.5 py-2.5 max-w-[82%] ${
                        msg.role === "user"
                          ? "bg-[#1C1C1C] dark:bg-white text-white dark:text-[#141414] rounded-br-sm"
                          : "bg-white dark:bg-white/[0.07] text-foreground/85 border border-black/[0.07] dark:border-white/[0.09] rounded-bl-sm shadow-sm"
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
        <div className="flex-shrink-0 border-t border-black/[0.07] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02]">
          {done ? (
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-foreground/35">AI-powered</p>
              <button
                onClick={onClose}
                className="h-8 px-5 rounded-full bg-foreground text-background text-[12.5px] font-medium hover:opacity-80 transition-opacity cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : hasSuggestions ? (
            <div className="px-3 py-3 flex flex-col items-end gap-1.5">
              {curStep.suggestions.map((s, i) => (
                <motion.button
                  key={s}
                  onClick={() => submit(s)}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white dark:bg-white/[0.07] rounded-2xl px-4 py-2 text-[13px] text-foreground/70 border border-black/[0.08] dark:border-white/[0.1] hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer shadow-sm"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          ) : !loading ? (
            <div className="px-3 py-3">
              <div className="flex items-center gap-2 bg-white dark:bg-white/[0.06] rounded-xl border border-black/[0.08] dark:border-white/[0.1] px-3 py-2.5 shadow-sm">
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
                  className="flex-1 text-[13.5px] text-foreground placeholder:text-foreground/30 bg-transparent outline-none"
                />
                <button
                  onClick={() => submit(input)}
                  disabled={!input.trim()}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-foreground disabled:opacity-20 transition-opacity flex-shrink-0 cursor-pointer"
                >
                  <SendHorizontal className="w-3.5 h-3.5 text-background" />
                </button>
              </div>
              {step === steps.length - 1 && (
                <p className="text-[11px] text-center text-foreground/30 mt-2">
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
