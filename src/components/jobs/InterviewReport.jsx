import { motion } from "framer-motion";
import { MessageSquare, Star, AlertTriangle, Crosshair, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_REPORTS = {
  "1": {
    communicationScore: 78,
    clarity: 82,
    confidence: 71,
    pacing: 80,
    strongestAnswer: {
      question: "Walk me through a design system you've owned end-to-end.",
      highlight:
        "Your answer showed clear ownership, measurable impact (30% faster prototyping), and a strong rationale for the decisions you made. Lead with this in the real interview.",
    },
    watchOutFor: [
      'You hedged twice with "I think maybe…" when describing your process. Own your decisions — Linear values directness.',
      "Your answer on cross-functional collaboration ran long. Tighten it to two concrete examples and stop.",
    ],
    roleSpecificGaps: [
      "You didn't connect your work to developer experience — a core value at Linear. Prepare a story that bridges design decisions to engineering velocity.",
      "When asked about metrics, you stayed qualitative. Bring at least one data point on adoption or error reduction from your design system work.",
    ],
  },
  "2": {
    communicationScore: 83,
    clarity: 88,
    confidence: 79,
    pacing: 82,
    strongestAnswer: {
      question: "How do you make complex technical concepts feel simple in UI?",
      highlight:
        "Concrete examples from real projects, clear before/after framing, and you named the mental model you used. This is a strong answer for a Vercel role — use it early.",
    },
    watchOutFor: [
      "You rushed through the onboarding flow example. Slow down — that story has more signal in it than you gave it time for.",
      'Avoid saying "it depends" without immediately following it with a framework. It reads as evasive without structure.',
    ],
    roleSpecificGaps: [
      "Vercel cares about async-first communication. Your answers were strong verbally but you didn't demonstrate how you document or write for async teams. Prepare a brief example.",
      "You didn't mention any frontend fundamentals. Even a brief reference to CSS, component thinking, or dev handoff would close this gap.",
    ],
  },
};

const FALLBACK_REPORT = {
  communicationScore: 75,
  clarity: 78,
  confidence: 70,
  pacing: 77,
  strongestAnswer: {
    question: "Tell me about a project you're most proud of.",
    highlight:
      "You structured the answer well and showed clear ownership of outcomes. This is your strongest signal — make sure it opens your real interview.",
  },
  watchOutFor: [
    'You used filler phrases ("like", "you know") more frequently under pressure. Record yourself and listen back — it\'s an easy fix with practice.',
    "One answer went over three minutes. The real interview will move faster; aim for 90 seconds per response.",
  ],
  roleSpecificGaps: [
    "Your answers didn't reference this company's specific product or customer. Research their recent launches and weave in one specific reference.",
    "You didn't mention your approach to feedback or iteration cycles — both came up implicitly in questions. Prepare a short answer for each.",
  ],
};

export function getMockReport(jobId) {
  return MOCK_REPORTS[jobId] ?? FALLBACK_REPORT;
}

// ---------------------------------------------------------------------------
// ScoreBar sub-component
// ---------------------------------------------------------------------------

function ScoreBar({ value, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-[12px] text-foreground/50 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
      <span className="w-8 text-right text-[12px] font-semibold text-foreground/70">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InterviewReport main component
// ---------------------------------------------------------------------------

const CARD_CLASS =
  "bg-white dark:bg-card rounded-xl border border-black/[0.06] dark:border-border p-5";

export function InterviewReport({ job, report: reportProp, onClose }) {
  const report = reportProp ?? getMockReport(job.id);

  return (
    <motion.div
      className="fixed inset-0 z-[400] bg-[#F0EDE7] dark:bg-background flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-border bg-white/60 dark:bg-card/60 backdrop-blur-sm flex-shrink-0">
        {/* Left: logo + role/company */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold"
            style={{ backgroundColor: job.logoColor }}
          >
            {job.logoLetter}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-foreground truncate leading-tight">
              {job.role}
            </p>
            <p className="text-[12px] text-foreground/50 truncate">{job.company}</p>
          </div>
        </div>

        {/* Right: label + close */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[12px] font-semibold text-foreground/40 uppercase tracking-widest hidden sm:block">
            Interview Report
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Close report"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Scrollable body                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-6 py-8 space-y-5">
          {/* Card 1: Communication score */}
          <motion.div
            className={CARD_CLASS}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-foreground/40 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-foreground/60">
                Communication score
              </span>
            </div>
            <div className="flex items-end gap-3 mb-5">
              <span className="text-[48px] font-bold leading-none text-foreground">
                {report.communicationScore}
              </span>
              <span className="text-[16px] text-foreground/30 pb-1.5">/100</span>
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
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-foreground/40 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-foreground/60">
                Strongest answer
              </span>
            </div>
            <p className="text-[13px] italic text-foreground/50 leading-[1.6] mb-3">
              &ldquo;{report.strongestAnswer.question}&rdquo;
            </p>
            <p className="text-[14px] text-foreground/75 leading-[1.65]">
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
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-foreground/40 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-foreground/60">Watch out for</span>
            </div>
            <div className="space-y-3.5">
              {report.watchOutFor.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 mt-[3px] w-5 h-5 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-orange-400">{i + 1}</span>
                  </div>
                  <p className="text-[14px] text-foreground/75 leading-[1.65]">{item}</p>
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
            <div className="flex items-center gap-2 mb-4">
              <Crosshair className="w-4 h-4 text-foreground/40 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-foreground/60">
                Role-specific gaps · {job.company}
              </span>
            </div>
            <div className="space-y-3.5">
              {report.roleSpecificGaps.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 mt-[3px] w-1 rounded-full bg-foreground/15 self-stretch min-h-[20px]" />
                  <p className="text-[14px] text-foreground/75 leading-[1.65]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.06] dark:border-border bg-white/60 dark:bg-card/60 backdrop-blur-sm flex-shrink-0">
        <p className="text-[11px] text-foreground/35">
          Generated after your mock session · {job.company}
        </p>
        <button
          onClick={onClose}
          className="h-8 px-5 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[13px] font-medium hover:opacity-80 transition-opacity"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}
