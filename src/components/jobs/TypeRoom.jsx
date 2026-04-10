import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DotTrail } from "./DotTrail";

// Questions are fetched from GET /jobs/questions on mount in index.jsx
// and passed down as a prop. onDone receives the full answers array:
//   [{ question: string, answer: string }, ...]
// which is sent directly to POST /jobs/recommend.

export function TypeRoom({ questions, onDone, onReset }) {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [collected, setCollected] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    setInput("");
  }, [current]);

  const advance = () => {
    if (!input.trim()) return;

    const answer = { question: questions[current], answer: input.trim() };
    const nextCollected = [...collected, answer];
    setCollected(nextCollected);

    const next = current + 1;
    if (next >= questions.length) {
      onDone(nextCollected);
    } else {
      setCurrent(next);
    }
  };

  if (!questions.length) return null;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-between bg-[#F0EDE7] dark:bg-background px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full dark:bg-[#FF553E]/6 blur-[120px]" />
      </div>

      <div />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg gap-10 w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            className="text-foreground text-[22px] font-medium leading-snug tracking-tight"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {questions[current]}
          </motion.p>
        </AnimatePresence>

        <div className="w-full flex items-center gap-3">
          <input
            ref={inputRef}
            data-testid="input-answer"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && advance()}
            placeholder="Type your answer…"
            className="flex-1 bg-foreground/5 border border-border rounded-2xl px-5 py-4 text-foreground text-[15px] placeholder:text-muted-foreground/50 outline-none focus:border-foreground/25 transition-colors"
          />
          <motion.button
            data-testid="button-next"
            onClick={advance}
            disabled={!input.trim()}
            className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center disabled:opacity-25 transition-opacity flex-shrink-0"
            whileTap={{ scale: 0.92 }}
          >
            <ArrowRight className="w-4 h-4 text-background" />
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <DotTrail current={current} total={questions.length} />
        <button
          data-testid="button-do-later-type"
          onClick={onReset}
          className="text-muted-foreground/50 text-[12px] hover:text-muted-foreground transition-colors"
        >
          I&apos;ll do it later
        </button>
      </div>
    </motion.div>
  );
}
