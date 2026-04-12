import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Search } from "lucide-react";
import Lottie from "lottie-react";
import aiAssistantAnimation from "@/assets/AI-Assistant.json";
import { DotTrail } from "./DotTrail";

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
  const inputRef = useRef(null);

  // Q1
  const [locationChoice, setLocationChoice] = useState(null);
  const [city, setCity] = useState("");
  const cityRef = useRef(null);

  // Q2
  const [levelChoice, setLevelChoice] = useState(null);

  const q0 = questions[0];
  const q1 = questions[1];
  const q2 = questions[2];

  useEffect(() => {
    if (current === 0) setTimeout(() => inputRef.current?.focus(), 50);
  }, [current]);

  useEffect(() => {
    if (locationChoice && locationChoice !== "Remote only") {
      setTimeout(() => cityRef.current?.focus(), 50);
    }
  }, [locationChoice]);

  const canNext = () => {
    if (current === 0) return role.trim().length > 0;
    if (current === 1)
      return locationChoice !== null &&
        (locationChoice === "Remote only" || city.trim().length > 0);
    if (current === 2) return levelChoice !== null;
    return false;
  };

  const advance = () => {
    if (!canNext()) return;
    if (current < 2) {
      setCurrent((c) => c + 1);
      return;
    }
    const locationAnswer =
      locationChoice === "Remote only"
        ? "Remote only"
        : `${locationChoice}: ${city.trim()}`;
    onDone([
      { question: q0.text, answer: role.trim() },
      { question: q1.text, answer: locationAnswer },
      { question: q2.text, answer: levelChoice },
    ]);
  };

  const goBack = () => setCurrent((c) => c - 1);

  const handleLocationOption = (option) => {
    setLocationChoice(option);
    if (option === "Remote only") {
      setCity("");
    } else if (option === "My city only" && !city) {
      setCity("Bengaluru");
    }
  };

  const isLastStep = current === 2;

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full dark:bg-[#FF553E]/6 blur-[120px]" />
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
          text={current === 0 ? (q0?.text || "") : current === 1 ? (q1?.text || "") : (q2?.text || "")}
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
                className="w-full bg-background/70 dark:bg-foreground/5 border border-border rounded-2xl px-5 py-4 text-foreground text-[15px] outline-none focus:border-foreground/30 transition-colors text-left"
              />
              <div className="flex flex-wrap justify-center gap-2">
                {(q0?.suggestions || []).map((s) => (
                  <button
                    key={s}
                    data-testid={`suggestion-${s.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setRole(s)}
                    className={`cursor-pointer px-4 py-2 rounded-full border text-[13px] transition-all duration-200 ${
                      role === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground bg-background/50 dark:bg-foreground/5 hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {s}
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
              <div className="flex flex-wrap justify-center gap-3 w-full">
                {(q1?.options || []).map((option) => (
                  <motion.button
                    key={option}
                    data-testid={`option-${option.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
                    onClick={() => handleLocationOption(option)}
                    whileTap={{ scale: 0.96 }}
                    className={`cursor-pointer px-5 py-3 rounded-full border text-[14px] font-medium transition-all duration-200 ${
                      locationChoice === option
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background/60 dark:bg-foreground/5 border-border text-foreground hover:border-foreground/40"
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {locationChoice && locationChoice !== "Remote only" && (
                  <motion.div
                    className="w-full flex flex-col gap-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-muted-foreground text-[13px] text-left">
                      {locationChoice === "My city only" ? "Which city?" : "Which cities are you open to?"}
                    </p>
                    <input
                      ref={cityRef}
                      data-testid="input-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && advance()}
                      className="w-full bg-background/70 dark:bg-foreground/5 border border-border rounded-2xl px-5 py-4 text-foreground text-[15px] outline-none focus:border-foreground/30 transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Q2 — Level */}
          {current === 2 && (
            <motion.div
              key="level"
              className="flex flex-col gap-3 w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32 }}
            >
              {(q2?.options || []).map((opt) => {
                const isChosen = levelChoice === opt.title;
                return (
                  <motion.button
                    key={opt.title}
                    data-testid={`option-${opt.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`}
                    onClick={() => setLevelChoice(opt.title)}
                    whileTap={{ scale: 0.985 }}
                    className={`cursor-pointer w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-left transition-all duration-200 ${
                      isChosen
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background/60 dark:bg-foreground/5 border-border text-foreground hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">{opt.title}</span>
                      <span className={`text-[13px] ${isChosen ? "text-background/70" : "text-muted-foreground"}`}>
                        {opt.desc}
                      </span>
                    </div>
                    {opt.sub && (
                      <span className={`text-[12px] font-medium flex-shrink-0 ml-4 ${isChosen ? "text-background/60" : "text-muted-foreground/60"}`}>
                        {opt.sub}
                      </span>
                    )}
                  </motion.button>
                );
              })}
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

          <DotTrail current={current} total={3} />

          {/* Next / Scan Jobs */}
          <motion.button
            data-testid={isLastStep ? "button-scan-jobs" : "button-next"}
            onClick={advance}
            disabled={!canNext()}
            whileTap={{ scale: 0.94 }}
            className="cursor-pointer flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-foreground text-background"
          >
            {isLastStep ? (
              <>Scan Jobs <Search className="w-4 h-4" /></>
            ) : (
              <>Next <ArrowRight className="w-4 h-4" /></>
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
