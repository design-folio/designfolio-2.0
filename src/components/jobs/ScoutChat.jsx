import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, SendHorizontal } from "lucide-react";
import { SCOUT_SUGGESTIONS } from "@/data/jobs";
import { _postJobsScout } from "@/network/jobs";
import { ColorOrb } from "@/components/ui/color-orb";

export function ScoutChat({ job, onClose, profileId }) {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showAll, setShowAll]       = useState(false);
  const [expanded, setExpanded]     = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const visibleSuggestions = showAll ? SCOUT_SUGGESTIONS : SCOUT_SUGGESTIONS.slice(0, 3);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setHasStarted(true);
    setInput("");
    setLoading(true);

    try {
      const res = await _postJobsScout(profileId, job.id, trimmed);
      const reply = res.data?.reply ?? "I couldn't get a response right now. Please try again.";
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  // While loading, append a transient bubble with null text so we can render dots
  const allMessages = loading
    ? [...messages, { role: "ai", text: null }]
    : messages;

  return createPortal(
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Backdrop — only when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[3px] pointer-events-auto"
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
          layout:   { type: "spring", bounce: 0.18, duration: 0.5 },
          opacity:  { duration: 0.22 },
          y:        { duration: 0.22 },
          scale:    { duration: 0.22 },
        }}
        className={`absolute pointer-events-auto flex flex-col overflow-hidden bg-white dark:bg-card border border-black/[0.1] dark:border-border shadow-2xl rounded-2xl ${
          expanded
            ? "inset-y-[6%] inset-x-0 mx-auto w-full max-w-[620px]"
            : "bottom-4 right-4 w-[360px] h-[500px]"
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/[0.08] dark:border-border">
          <div className="flex items-center gap-2 min-w-0">
            <span className="orb-spinning"><ColorOrb dimension="14px" spinDuration={6} /></span>
            <span className="text-[14px] font-semibold text-foreground">Scout</span>
            <span className="text-[13px] text-foreground/50 truncate">· {job.role} at {job.company}</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
            <button
              data-testid="button-scout-expand"
              onClick={() => setExpanded(v => !v)}
              aria-label={expanded ? "Collapse Scout" : "Expand Scout"}
              className="w-7 h-7 flex items-center justify-center rounded-md text-foreground/40 hover:text-foreground/70 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Close Scout chat"
              className="w-7 h-7 flex items-center justify-center rounded-md text-foreground/40 hover:text-foreground/70 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 relative">
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
                <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4">
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
                    className={`text-center font-light text-foreground/55 mt-5 leading-[1.5] max-w-[240px] ${expanded ? "text-[20px]" : "text-[15px]"}`}
                  >
                    What do you want to know about {job.company}?
                  </motion.p>
                </div>

                {/* Right-aligned suggestion pills, staggered */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2 px-4 pb-4">
                  {visibleSuggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      data-testid={`button-scout-suggestion-${i}`}
                      onClick={() => send(s)}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 + 0.18, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl px-4 py-2.5 text-[14px] text-foreground/70 border border-black/[0.06] dark:border-border hover:text-foreground transition-colors cursor-pointer"
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
                      className="text-[13px] text-foreground/30 hover:text-foreground/50 transition-colors mt-0.5 pr-1 cursor-pointer"
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
                className="absolute inset-0 flex flex-col min-h-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                  {allMessages.map((msg, i) => {
                    const isLastAi = msg.role === "ai" && allMessages.slice(i + 1).every(m => m.role !== "ai");
                    return (
                      <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "ai" && (
                          <div className="flex-shrink-0 mb-0.5 w-5 h-5 flex items-center justify-center">
                            {isLastAi ? (
                              <span className="orb-spinning">
                                <ColorOrb dimension="20px" spinDuration={6} />
                              </span>
                            ) : (
                              <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-dashed border-foreground/20" />
                            )}
                          </div>
                        )}
                        <div className={`text-[14px] leading-[1.6] rounded-2xl px-3.5 py-2.5 max-w-[80%] ${
                          msg.role === "user"
                            ? "bg-foreground text-background rounded-br-sm"
                            : "bg-black/[0.04] dark:bg-white/[0.06] text-foreground/85 border border-black/[0.06] dark:border-border rounded-bl-sm"
                        }`}>
                          {msg.text ?? (
                            <span className="flex gap-1 items-center py-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:0ms]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:150ms]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce [animation-delay:300ms]" />
                            </span>
                          )}
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
        <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-black/[0.08] dark:border-border">
          <div className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.07] dark:border-border px-3 py-2.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !loading) send(input); }}
              placeholder={hasStarted ? "Ask a follow-up…" : "Or type your own question…"}
              disabled={loading}
              aria-label="Message Scout"
              className="flex-1 text-[14px] text-foreground placeholder:text-foreground/30 bg-transparent outline-none disabled:opacity-50"
            />
            <button
              data-testid="button-scout-send"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-foreground disabled:opacity-20 transition-opacity flex-shrink-0 cursor-pointer"
            >
              <SendHorizontal className="w-3.5 h-3.5 text-background" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
