import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Sparkles, X, ArrowUpCircle } from "lucide-react";
import { SCOUT_SUGGESTIONS, SCOUT_RESPONSES } from "@/data/jobs";

// NOTE: APIS TO BE INTEGRATED HERE — POST /api/jobs/scout with { jobId, message }
// Replace the local SCOUT_RESPONSES lookup with an API call that returns the AI response.

export function ScoutChat({ job, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `I see you're asking about the ${job.role} role at ${job.company}. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestionsGone, setSuggestionsGone] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    if (!text.trim()) return;
    // NOTE: APIS TO BE INTEGRATED HERE — POST /api/jobs/scout { jobId: job.id, message: text }
    const response =
      SCOUT_RESPONSES[text] ??
      "Great question. Based on this role and your profile, I'd look at how your past work maps to their requirements — especially any areas where you've driven end-to-end design decisions.";
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "ai", text: response },
    ]);
    setSuggestionsGone(true);
    setInput("");
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-4 right-4 w-[340px] bg-white dark:bg-card rounded-2xl shadow-2xl border border-black/[0.08] dark:border-border flex flex-col z-[200]"
      style={{ maxHeight: "520px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-foreground" />
          <span className="text-[14px] font-semibold text-foreground">Scout</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 rounded-md text-foreground/40 hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`text-[13px] leading-relaxed rounded-xl px-3 py-2 max-w-[88%] ${
                msg.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-foreground/80"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {!suggestionsGone && (
          <div className="space-y-1.5 pt-0.5">
            {SCOUT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full text-left text-[12px] text-foreground/70 border border-black/[0.10] dark:border-border rounded-lg px-3 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors flex items-center justify-between gap-2"
              >
                <span>{s}</span>
                <ArrowUpCircle className="w-3.5 h-3.5 flex-shrink-0 text-foreground/30" />
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-black/[0.06] dark:border-border flex-shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
          placeholder="Ask me anything..."
          className="flex-1 text-[13px] text-foreground placeholder:text-foreground/30 bg-transparent outline-none py-1"
        />
        <button
          onClick={() => send(input)}
          className="flex items-center justify-center w-7 h-7 rounded-full border border-black/[0.12] dark:border-border text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-colors flex-shrink-0"
        >
          <ArrowUpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>,
    document.body,
  );
}
