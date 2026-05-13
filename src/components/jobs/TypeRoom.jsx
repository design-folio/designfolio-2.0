import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Search } from "lucide-react";
import Lottie from "lottie-react";
import aiAssistantAnimation from "@/assets/AI-Assistant.json";
import { DotTrail } from "./DotTrail";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { _getJobRoleSuggestions } from "@/network/jobs";

// Inline BlurredStagger — animates each word with blur fade-in stagger
function BlurredStagger({ text, className }) {
  const words = text.split(" ");
  return (
    <p className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${text}-${i}`}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

export function TypeRoom({ questions, onDone, onReset }) {
  const [current, setCurrent] = useState(0);

  // Q0
  const [role, setRole] = useState("Senior Product Designer");
  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestTimerRef = useRef(null);

  // Q1
  const [locationChoice, setLocationChoice] = useState(null);
  const [city, setCity] = useState("");
  const cityRef = useRef(null);

  const q0 = questions[0];
  const q1 = questions[1];

  useEffect(() => {
    if (current === 0) setTimeout(() => inputRef.current?.focus(), 50);
  }, [current]);

  useEffect(() => {
    if (locationChoice) {
      setTimeout(() => cityRef.current?.focus(), 50);
    }
  }, [locationChoice]);

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

  // Auto-select the only option when Q1 appears so city input shows immediately
  useEffect(() => {
    if (current === 1 && q1?.options?.length > 0 && locationChoice === null) {
      setLocationChoice(q1.options[0]);
    }
  }, [current, q1, locationChoice]);

  const canNext = () => {
    if (current === 0) return role.trim().length > 0;
    if (current === 1) return city.trim().length > 0;
    return false;
  };

  const advance = () => {
    if (!canNext()) return;
    if (current < 1) {
      setCurrent((c) => c + 1);
      return;
    }
    onDone([
      { question: q0.text, answer: role.trim() },
      { question: q1.text, answer: city.trim() },
    ]);
  };

  const goBack = () => setCurrent((c) => c - 1);

  const handleLocationOption = (option) => {
    setLocationChoice(option);
  };

  const isLastStep = current === 1;

  if (!questions.length) return null;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-between bg-[#F0EDE7] dark:bg-background px-6 py-12 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#FF553E]/5 dark:bg-[#FF553E]/15 blur-[120px]" />
      </div>

      <div />

      {/* Question + answer area */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg gap-6 w-full">
        {/* Lottie AI animation */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.35 }}
          className="w-16 h-16"
        >
          <Lottie animationData={aiAssistantAnimation} loop />
        </motion.div>

        {/* Question text — re-mounts on question change for stagger reset */}
        <BlurredStagger
          key={current}
          text={current === 0 ? (q0?.text || "") : (q1?.text || "")}
          className="text-foreground text-[22px] font-medium leading-snug tracking-tight"
        />

        <AnimatePresence mode="wait">
          {/* Q0 — Role */}
          {current === 0 && (
            <motion.div
              key="role-input"
              className="flex flex-col items-center gap-4 w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32 }}
            >
              <input
                ref={inputRef}
                data-testid="input-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && advance()}
                className="w-full bg-background dark:bg-foreground/8 border border-border rounded-2xl px-5 py-4 text-foreground text-[15px] outline-none focus:border-foreground/30 transition-colors text-left"
              />
              <div className="flex flex-wrap justify-center gap-2">
                {roleSuggestions.map((s) => (
                  <button
                    key={s.label}
                    data-testid={`suggestion-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setRole(s.label)}
                    className={`cursor-pointer px-4 py-2 rounded-full border text-[13px] transition-all duration-200 ${role === s.label
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground bg-background dark:bg-foreground/8 hover:border-foreground/30 hover:text-foreground"
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Q1 — Location */}
          {current === 1 && (
            <motion.div
              key="location"
              className="flex flex-col items-center gap-5 w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32 }}
            >
              <AnimatePresence>
                {locationChoice && (
                  <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <LocationAutocomplete
                      inputRef={cityRef}
                      value={city}
                      onChange={setCity}
                      onSelect={setCity}
                      onKeyDown={(e) => e.key === "Enter" && advance()}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-lg mt-8">
        <div className="flex items-center justify-between w-full gap-3">
          {/* Back */}
          <motion.button
            data-testid="button-back"
            onClick={goBack}
            whileTap={{ scale: 0.94 }}
            className={`cursor-pointer flex items-center gap-1.5 px-5 py-3 rounded-full border border-border text-[14px] font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:border-foreground/30 ${current === 0 ? "invisible" : ""}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          <DotTrail current={current} total={2} />

          {/* Next / Scan Jobs */}
          <motion.button
            data-testid={isLastStep ? "button-scan-jobs" : "button-next"}
            onClick={advance}
            disabled={!canNext()}
            whileTap={{ scale: 0.94 }}
            className="cursor-pointer flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-foreground text-background"
          >
            {isLastStep ? (
              <>Find matching Jobs <Search className="w-4 h-4" /></>
            ) : (
              <>Continue <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>

        <button
          data-testid="button-do-later-type"
          onClick={onReset}
          className="cursor-pointer text-muted-foreground/50 text-[12px] hover:text-muted-foreground transition-colors"
        >
          I&apos;ll do it later
        </button>
      </div>
    </motion.div>
  );
}
