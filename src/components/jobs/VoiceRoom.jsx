import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Keyboard } from "lucide-react";
import { Waveform } from "./Waveform";
import { DotTrail } from "./DotTrail";

// Speech-to-Text via Web Speech API (SpeechRecognition / webkitSpeechRecognition).
// Supported in Chrome, Edge, Safari ≥ 14.1. Not supported in Firefox.
// Falls back gracefully: shows "Switch to typing" when unsupported.
//
// Each answer is collected as: { question: string, answer: string }
// and passed to onDone(answers[]) which calls POST /jobs/recommend.

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export function VoiceRoom({ questions, onDone, onReset }) {
  const [current, setCurrent] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState(""); // live interim + final
  const [collected, setCollected] = useState([]);
  const [isSpeechSupported] = useState(() => !!getSpeechRecognition());
  const [hasPermission, setHasPermission] = useState(true); // false if mic denied

  const recognitionRef = useRef(null);
  // Ref holds the latest committed final transcript across the closure
  const finalTranscriptRef = useRef("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  // Reset transcript when question changes
  useEffect(() => {
    setTranscript("");
    finalTranscriptRef.current = "";
  }, [current]);

  const commitAnswer = useCallback(
    (text) => {
      const trimmed = text.trim();
      const answer = {
        question: questions[current],
        answer: trimmed || "(no answer)",
      };
      const nextCollected = [...collected, answer];
      setCollected(nextCollected);
      setTranscript("");
      finalTranscriptRef.current = "";

      const next = current + 1;
      if (next >= questions.length) {
        onDone(nextCollected);
      } else {
        setCurrent(next);
      }
    },
    [current, questions, collected, onDone],
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    // onend handler will fire and call commitAnswer
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;      // keep running until user stops
    recognition.interimResults = true;  // show live transcript while speaking
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setHasPermission(true);
    };

    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText = result[0].transcript;
        }
      }

      finalTranscriptRef.current = finalText;
      // Show final + current interim together
      setTranscript((finalText + interimText).trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return; // intentional stop — ignore
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setHasPermission(false);
      }
      // 'no-speech' is fine — user paused, recognition will continue
      if (event.error !== "no-speech") {
        setListening(false);
      }
    };

    recognition.onend = () => {
      setListening(false);
      // Only commit if we have a transcript (don't commit empty answers on abort)
      const captured = finalTranscriptRef.current.trim();
      if (captured) {
        commitAnswer(captured);
      }
    };

    recognitionRef.current = recognition;
    finalTranscriptRef.current = "";
    setTranscript("");
    setListening(true);

    try {
      recognition.start();
    } catch {
      // Recognition already running — ignore
    }
  }, [commitAnswer]);

  const handleMic = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
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
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-0 dark:opacity-100"
          animate={{
            backgroundColor: listening
              ? "rgba(255,85,62,0.12)"
              : "rgba(255,85,62,0.06)",
          }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg gap-8 w-full">
        {/* Question */}
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

        {/* Waveform */}
        <Waveform listening={listening} />

        {/* Live transcript display */}
        <div className="w-full min-h-[48px] flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            {transcript ? (
              <motion.p
                key="transcript"
                className="text-foreground/70 text-[15px] leading-relaxed text-center"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {transcript}
              </motion.p>
            ) : listening ? (
              <motion.p
                key="listening"
                className="text-muted-foreground/40 text-[14px] italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Listening…
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Not supported / permission denied notice */}
        {!isSpeechSupported && (
          <p className="text-[12px] text-amber-500/80 bg-amber-500/10 rounded-xl px-4 py-2.5">
            Voice input isn&apos;t supported in this browser.
            <br />
            Chrome or Edge recommended.
          </p>
        )}
        {isSpeechSupported && !hasPermission && (
          <p className="text-[12px] text-red-500/80 bg-red-500/10 rounded-xl px-4 py-2.5">
            Microphone access was denied.
            <br />
            Check your browser permissions and try again.
          </p>
        )}

        {/* Mic button */}
        {isSpeechSupported && hasPermission && (
          <motion.button
            data-testid="button-mic"
            onClick={handleMic}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              listening
                ? "bg-[#FF553E] shadow-[0_0_40px_rgba(255,85,62,0.4)]"
                : "bg-foreground/10 border border-border hover:bg-foreground/15"
            }`}
            whileTap={{ scale: 0.93 }}
          >
            {listening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-muted-foreground" />
            )}
          </motion.button>
        )}

        <p className="text-muted-foreground/60 text-[12px]">
          {listening
            ? "Tap to stop and submit"
            : isSpeechSupported && hasPermission
              ? "Tap to speak"
              : ""}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <DotTrail current={current} total={questions.length} />

        {/* Switch to typing */}
        <button
          data-testid="button-switch-to-type"
          onClick={onReset}
          className="flex items-center gap-1.5 text-muted-foreground/50 text-[12px] hover:text-muted-foreground transition-colors"
        >
          <Keyboard className="w-3 h-3" />
          Switch to typing
        </button>
      </div>
    </motion.div>
  );
}
