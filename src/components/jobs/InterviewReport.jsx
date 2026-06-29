import { motion } from "motion/react";
import { MessageSquare, Star, AlertTriangle, Crosshair, X, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// ScoreBar sub-component
// ---------------------------------------------------------------------------

function ScoreBar({ value, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground/50 w-20 shrink-0 text-[12px]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        <motion.div
          className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
      <span className="text-foreground/70 w-8 text-right text-[12px] font-semibold">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InterviewReport main component
// ---------------------------------------------------------------------------

const CARD_CLASS =
  "bg-white dark:bg-card rounded-xl border border-black/[0.06] dark:border-border p-5";

export function InterviewReport({ job, report, loading = false, onClose }) {
  return (
    <motion.div
      className="dark:bg-background fixed inset-0 z-[400] flex flex-col overflow-hidden bg-[#F0EDE7]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="dark:border-border flex shrink-0 items-center justify-between border-b border-black/[0.06] bg-white px-6 py-4 dark:bg-[#1A1713]">
        {/* Left: logo + role/company */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
            style={{ backgroundColor: job.logoColor }}
          >
            {job.logoLetter}
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate text-[14px] leading-tight font-semibold">
              {job.role}
            </p>
            <p className="text-foreground/50 truncate text-[12px]">{job.company}</p>
          </div>
        </div>

        {/* Right: label + close */}
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-foreground/40 hidden text-[12px] font-semibold tracking-widest uppercase sm:block">
            Interview Report
          </span>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
            aria-label="Close report"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Scrollable body                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <Loader2 className="text-foreground/25 h-8 w-8 animate-spin" />
            <p className="text-foreground/60 text-[15px] font-medium">Analysing your interview…</p>
            <p className="text-foreground/35 max-w-xs text-[13px]">
              Gemini is reviewing your responses. This takes about 10–15 seconds.
            </p>
          </div>
        ) : !report ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <MessageSquare className="text-foreground/20 h-8 w-8" />
            <p className="text-foreground/60 text-[15px] font-medium">No transcript recorded</p>
            <p className="text-foreground/35 max-w-xs text-[13px]">
              The interview ended before any conversation was captured. Try again and speak with the
              interviewer to get a report.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-[680px] space-y-5 px-6 py-8">
            {/* Card 1: Communication score */}
            <motion.div
              className={CARD_CLASS}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="text-foreground/40 h-4 w-4 shrink-0" />
                <span className="text-foreground/60 text-[13px] font-semibold">
                  Communication score
                </span>
              </div>
              <div className="mb-5 flex items-end gap-3">
                <span className="text-foreground text-[48px] leading-none font-bold">
                  {report.communicationScore}
                </span>
                <span className="text-foreground/30 pb-1.5 text-[16px]">/100</span>
              </div>
              <div className="space-y-3">
                <ScoreBar value={report.clarity} label="Clarity" />
                <ScoreBar value={report.confidence} label="Confidence" />
                <ScoreBar value={report.pacing} label="Pacing" />
              </div>
            </motion.div>

            {/* Card 2: Strongest answer */}
            <motion.div
              className={CARD_CLASS}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Star className="text-foreground/40 h-4 w-4 shrink-0" />
                <span className="text-foreground/60 text-[13px] font-semibold">
                  Strongest answer
                </span>
              </div>
              <p className="text-foreground/50 mb-3 text-[13px] leading-[1.6] italic">
                &ldquo;{report.strongestAnswer.question}&rdquo;
              </p>
              <p className="text-foreground/75 text-[14px] leading-[1.65]">
                {report.strongestAnswer.highlight}
              </p>
            </motion.div>

            {/* Card 3: Watch out for */}
            <motion.div
              className={CARD_CLASS}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.19 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="text-foreground/40 h-4 w-4 shrink-0" />
                <span className="text-foreground/60 text-[13px] font-semibold">Watch out for</span>
              </div>
              <div className="space-y-3.5">
                {report.watchOutFor.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/30">
                      <span className="text-[10px] font-bold text-orange-400">{i + 1}</span>
                    </div>
                    <p className="text-foreground/75 text-[14px] leading-[1.65]">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Card 4: Role-specific gaps */}
            <motion.div
              className={CARD_CLASS}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.26 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Crosshair className="text-foreground/40 h-4 w-4 shrink-0" />
                <span className="text-foreground/60 text-[13px] font-semibold">
                  Role-specific gaps · {job.company}
                </span>
              </div>
              <div className="space-y-3.5">
                {report.roleSpecificGaps.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="bg-foreground/15 mt-[3px] min-h-[20px] w-1 shrink-0 self-stretch rounded-full" />
                    <p className="text-foreground/75 text-[14px] leading-[1.65]">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="dark:border-border flex shrink-0 items-center justify-between border-t border-black/[0.06] bg-white px-6 py-4 dark:bg-[#1A1713]">
        <p className="text-foreground/35 text-[11px]">
          Generated after your mock session · {job.company}
        </p>
        <button
          onClick={onClose}
          className="h-8 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}
