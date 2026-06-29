import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Maximize2, Minimize2, SendHorizontal } from "lucide-react";
import { SCOUT_SUGGESTIONS } from "@/data/jobs";
import { _postJobsScout } from "@/network/jobs";
import { ColorOrb } from "@/components/ui/color-orb";

const typingKeyframes = `
  @keyframes typing-wave {
    0%, 60%, 100% { transform: translateY(0px); opacity: 0.3; }
    30%            { transform: translateY(-5px); opacity: 1; }
  }
`;

function TypingDots() {
  return (
    <span className="flex items-center gap-[5px] py-1">
      <style>{typingKeyframes}</style>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            display: "inline-block",
            backgroundColor: "currentColor",
            opacity: 0.3,
            animation: `typing-wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}

export function ScoutChat({ job, onClose, profileId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const visibleSuggestions = showAll ? SCOUT_SUGGESTIONS : SCOUT_SUGGESTIONS.slice(0, 3);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = [...messages];
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setHasStarted(true);
    setInput("");
    setLoading(true);

    try {
      const res = await _postJobsScout(profileId, job.id, trimmed, history);
      const reply = res.data?.reply ?? "I couldn't get a response right now. Please try again.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  // While loading, append a transient bubble with null text so we can render dots
  const allMessages = loading ? [...messages, { role: "ai", text: null }] : messages;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[200]">
      {/* Backdrop — only when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute inset-0 bg-black/20 backdrop-blur-[3px]"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{
          layout: { type: "spring", bounce: 0.18, duration: 0.5 },
          opacity: { duration: 0.22 },
          y: { duration: 0.22 },
          scale: { duration: 0.22 },
        }}
        className={`dark:bg-card dark:border-border pointer-events-auto absolute flex flex-col overflow-hidden rounded-2xl border border-black/[0.1] bg-white shadow-2xl ${
          expanded
            ? "inset-x-0 inset-y-[6%] mx-auto w-full max-w-[620px]"
            : "right-4 bottom-4 h-[500px] w-[360px]"
        }`}
      >
        {/* Header */}
        <div className="dark:border-border flex shrink-0 items-center justify-between border-b border-black/[0.08] bg-black/[0.02] px-4 py-3 dark:bg-white/[0.04]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="orb-spinning">
              <ColorOrb dimension="14px" spinDuration={6} />
            </span>
            <span className="text-foreground text-[14px] font-semibold">Scout</span>
            <span className="text-foreground/50 truncate text-[13px]">
              · {job.role} at {job.company}
            </span>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-0.5">
            <button
              data-testid="button-scout-expand"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Collapse Scout" : "Expand Scout"}
              className="text-foreground/40 hover:text-foreground/70 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            >
              {expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close Scout chat"
              className="text-foreground/40 hover:text-foreground/70 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              /* ── Initial: orb + prompt + suggestions ── */
              <motion.div
                key="initial"
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Centred orb + question */}
                <div className="flex flex-1 flex-col items-center justify-center px-5 pb-4">
                  <motion.div
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="orb-always-active"
                  >
                    <ColorOrb dimension={expanded ? "60px" : "40px"} spinDuration={5} />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.35 }}
                    className={`text-foreground/55 mt-5 max-w-[240px] text-center leading-[1.5] font-light ${expanded ? "text-[20px]" : "text-[15px]"}`}
                  >
                    What do you want to know about {job.company}?
                  </motion.p>
                </div>

                {/* Right-aligned suggestion pills, staggered */}
                <div className="flex shrink-0 flex-col items-end gap-2 px-4 pb-4">
                  {visibleSuggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      data-testid={`button-scout-suggestion-${i}`}
                      onClick={() => send(s)}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: i * 0.06 + 0.18,
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="text-foreground/70 dark:border-border hover:text-foreground cursor-pointer rounded-2xl border border-black/[0.06] bg-black/[0.04] px-4 py-2.5 text-[14px] transition-colors dark:bg-white/[0.06]"
                    >
                      {s}
                    </motion.button>
                  ))}
                  {!showAll && SCOUT_SUGGESTIONS.length > 3 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      onClick={() => setShowAll(true)}
                      className="text-foreground/30 hover:text-foreground/50 mt-0.5 cursor-pointer pr-1 text-[13px] transition-colors"
                    >
                      Show more
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* ── Chat state ── */
              <motion.div
                key="chat"
                className="absolute inset-0 flex min-h-0 flex-col"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {allMessages.map((msg, i) => {
                    const isLastAi =
                      msg.role === "ai" && allMessages.slice(i + 1).every((m) => m.role !== "ai");
                    return (
                      <div
                        key={i}
                        className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "ai" && (
                          <div className="mb-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                            {isLastAi ? (
                              <span className="orb-spinning">
                                <ColorOrb dimension="20px" spinDuration={6} />
                              </span>
                            ) : (
                              <div className="border-foreground/20 h-[18px] w-[18px] rounded-full border-[1.5px] border-dashed" />
                            )}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.6] ${
                            msg.role === "user"
                              ? "bg-foreground text-background rounded-br-sm"
                              : "text-foreground/85 dark:border-border rounded-bl-sm border border-black/[0.06] bg-black/[0.04] dark:bg-white/[0.06]"
                          }`}
                        >
                          {msg.text ?? <TypingDots />}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="dark:border-border shrink-0 border-t border-black/[0.08] px-3 pt-2 pb-3">
          <div className="dark:border-border flex items-center gap-2 rounded-xl border border-black/[0.07] bg-black/[0.04] px-3 py-2.5 dark:bg-white/[0.06]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) send(input);
              }}
              placeholder={hasStarted ? "Ask a follow-up…" : "Or type your own question…"}
              disabled={loading}
              aria-label="Message Scout"
              className="text-foreground placeholder:text-foreground/30 flex-1 bg-transparent text-[14px] outline-none disabled:opacity-50"
            />
            <button
              data-testid="button-scout-send"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="bg-foreground flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity disabled:opacity-20"
            >
              <SendHorizontal className="text-background h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
