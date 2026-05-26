import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, BookmarkPlus, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "./motion-constants";

// ── Gauge geometry (GA0=240° start, GA1=120° end → 240° sweep) ───────────────
const GA0 = 240, GA1 = 120, GCX = 50, GCY = 52, GR = 34, GSW = 7;
const GVW = 100, GVH = 72;

function gpt(deg) {
  const r = (deg * Math.PI) / 180;
  return { x: GCX + GR * Math.sin(r), y: GCY - GR * Math.cos(r) };
}
function garc(a1, a2) {
  const s = gpt(a1), e = gpt(a2);
  const sw = ((a2 - a1) + 360) % 360;
  if (sw < 0.1) return "";
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${GR} ${GR} 0 ${sw > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

function YourScoreGauge({ isDark, score = null }) {
  const uid = useId().replace(/:/g, "");
  const trackPath = garc(GA0, GA1);
  const trackColor = isDark ? "hsl(20,8%,18%)" : "rgba(215,210,203,0.85)";
  const xL = gpt(GA0).x, xR = gpt(GA1).x;

  // When score is known: fill arc to score%, dot moves to that position
  const fillRatio = score !== null ? score / 100 : 1;
  const dotAngle = score !== null ? GA0 + fillRatio * 240 : 0; // 0° = midpoint teaser for "?"
  const dot = gpt(dotAngle);

  return (
    <svg viewBox={`0 0 ${GVW} ${GVH}`} width={GVW} height={GVH} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`rb-ys-${uid}`} gradientUnits="userSpaceOnUse" x1={xL} y1="0" x2={xR} y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="28%" stopColor="#f97316" />
          <stop offset="52%" stopColor="#eab308" />
          <stop offset="78%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d={trackPath} fill="none" stroke={trackColor} strokeWidth={GSW} strokeLinecap="round" />
      <motion.path
        d={trackPath} fill="none" stroke={`url(#rb-ys-${uid})`} strokeWidth={GSW - 1} strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: fillRatio }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />
      <motion.path
        d={trackPath} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={(GSW - 1) * 0.5} strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: fillRatio }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
      <motion.circle
        cx={dot.x} cy={dot.y} r={GSW * 0.48} fill="white" stroke="rgba(0,0,0,0.12)" strokeWidth={0.8}
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.3, ease: "backOut" }}
      />
      <motion.text
        x={GCX} y={GCY - 2} textAnchor="middle" dominantBaseline="middle"
        fill={isDark ? "rgba(240,237,232,0.85)" : "#1A1A1A"}
        fontSize={score !== null ? "20" : "22"} fontWeight="800"
        style={{ userSelect: "none", fontFamily: "inherit", letterSpacing: "-0.5px" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {score !== null ? `${score}` : "?"}
      </motion.text>
    </svg>
  );
}

function TopApplicantsGauge({ isDark }) {
  const trackPath = garc(GA0, GA1);
  const trackColor = isDark ? "hsl(20,8%,22%)" : "rgba(215,210,203,0.85)";
  const dashColor = isDark ? "hsl(20,8%,30%)" : "rgba(190,185,178,0.95)";

  return (
    <svg viewBox={`0 0 ${GVW} ${GVH}`} width={GVW} height={GVH} style={{ overflow: "visible", display: "block" }}>
      <path d={trackPath} fill="none" stroke={trackColor} strokeWidth={GSW} strokeLinecap="round" />
      <path d={trackPath} fill="none" stroke={dashColor} strokeWidth={GSW - 2} strokeLinecap="round" />
      <text
        x={GCX} y={GCY - 2} textAnchor="middle" dominantBaseline="middle"
        fill={isDark ? "rgba(240,237,232,0.25)" : "rgba(26,26,26,0.22)"}
        fontSize="22" fontWeight="700"
        style={{ userSelect: "none", fontFamily: "inherit" }}
      >
        —
      </text>
    </svg>
  );
}

const BLURRED_SKILLS = ["Figma", "Design Systems", "Interaction Design", "Visual Design", "Prototyping"];

const CARD = "bg-white dark:bg-[#28231E] rounded-2xl border border-black/[0.05] dark:border-[#302B28] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]";

export function CTASkeleton() {
  return (
    <div className={`${CARD} p-5 space-y-3`}>
      <div className="h-9 rounded-full bg-foreground/[0.06] animate-pulse" />
      <div className="h-3 w-2/3 mx-auto rounded-full bg-foreground/[0.04] animate-pulse" />
    </div>
  );
}

export function BoostCard({ authState, isDark, isSaving, matchScore, onSave, onFindScore }) {
  if (authState === "loading") return <CTASkeleton />;

  return (
    <AnimatePresence mode="wait">
      {authState === "new" && (
        <motion.div
          key="boost-new"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className={`${CARD} p-5`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-5">
            <h3 className="text-[14px] font-semibold text-foreground leading-snug">
              Boost your interview chances
            </h3>
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 rounded-full px-2 py-0.5 mt-0.5">
              FREE
            </span>
          </div>

          {/* Gauges */}
          <div className="flex items-center justify-between gap-1 mb-4 px-0.5">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <YourScoreGauge isDark={isDark} />
              <span className="text-[11px] text-foreground/50 font-medium tracking-tight">Your Score</span>
            </div>
            <div className="flex items-center gap-[2px] opacity-20 mb-6 flex-shrink-0">
              {[0, 1, 2].map((i) => (
                <svg key={i} width="8" height="12" viewBox="0 0 8 12" fill="none">
                  <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                    className="text-foreground" />
                </svg>
              ))}
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TopApplicantsGauge isDark={isDark} />
              <span className="text-[11px] text-foreground/50 font-medium tracking-tight">Top Applicants</span>
            </div>
          </div>

          <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mb-4" />

          {/* Blurred skills */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Lock className="w-3 h-3 text-foreground/35" />
              <span className="text-[11px] font-semibold text-foreground/50 uppercase tracking-widest">
                Must-Have Skills
              </span>
            </div>
            <div className="relative">
              <div
                className="flex flex-wrap gap-1.5 select-none pointer-events-none"
                style={{ filter: "blur(4px)" }}
              >
                {BLURRED_SKILLS.map((s) => (
                  <span key={s} className="inline-flex items-center font-jetbrains text-[10px] font-semibold uppercase tracking-wide text-[#3D3630] dark:text-white/55 bg-[#EAE5DF] dark:bg-[#1F1C1C] rounded-md px-2 py-1 whitespace-nowrap">
                    {s}
                  </span>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={onFindScore}
                  className="flex items-center gap-1.5 bg-white/70 dark:bg-[#28231E]/80 backdrop-blur-[2px] rounded-lg px-3 py-1.5 border border-black/[0.06] dark:border-white/[0.07] hover:bg-white/90 dark:hover:bg-[#28231E]/95 transition-colors"
                >
                  <Lock className="w-3 h-3 text-foreground/50" />
                  <span className="text-[11px] font-semibold text-foreground/55">Sign up to unlock</span>
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onFindScore}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[13px] font-semibold hover:opacity-80 transition-opacity active:scale-[0.97]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Find my Score
          </button>
          <p className="text-[11px] text-foreground/35 text-center mt-3 leading-relaxed">
            Connect your portfolio to see how you rank against top applicants.
          </p>
        </motion.div>
      )}

      {authState === "loggedin" && (
        <motion.div
          key="boost-loggedin"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className={`${CARD} p-5`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-5">
            <h3 className="text-[14px] font-semibold text-foreground leading-snug">
              Save this job to reveal your match score.
            </h3>
          </div>

          {/* Gauges */}
          <div className="flex items-center justify-between gap-1 mb-4 px-0.5">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <YourScoreGauge isDark={isDark} />
              <span className="text-[11px] text-foreground/50 font-medium tracking-tight">Your Score</span>
            </div>
            <div className="flex items-center gap-[2px] opacity-20 mb-6 flex-shrink-0">
              {[0, 1, 2].map((i) => (
                <svg key={i} width="8" height="12" viewBox="0 0 8 12" fill="none">
                  <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                    className="text-foreground" />
                </svg>
              ))}
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <TopApplicantsGauge isDark={isDark} />
              <span className="text-[11px] text-foreground/50 font-medium tracking-tight">Top Applicants</span>
            </div>
          </div>

          <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mb-4" />

          {/* Blurred skills */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Lock className="w-3 h-3 text-foreground/35" />
              <span className="text-[11px] font-semibold text-foreground/50 uppercase tracking-widest">
                Must-Have Skills
              </span>
            </div>
            <div className="relative">
              <div
                className="flex flex-wrap gap-1.5 select-none pointer-events-none"
                style={{ filter: "blur(4px)" }}
              >
                {BLURRED_SKILLS.map((s) => (
                  <span key={s} className="inline-flex items-center font-jetbrains text-[10px] font-semibold uppercase tracking-wide text-[#3D3630] dark:text-white/55 bg-[#EAE5DF] dark:bg-[#1F1C1C] rounded-md px-2 py-1 whitespace-nowrap">
                    {s}
                  </span>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center gap-1.5 bg-white/70 dark:bg-[#28231E]/80 backdrop-blur-[2px] rounded-lg px-3 py-1.5 border border-black/[0.06] dark:border-white/[0.07] text-[11px] font-semibold text-foreground/55">
                  <Lock className="w-3 h-3 text-foreground/50" />
                  Save to unlock
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="default"
            className="w-full transition-all duration-[160ms] active:scale-[0.97]"
            onClick={onSave}
            disabled={isSaving}
          >
            <BookmarkPlus className="w-4 h-4" />
            {isSaving ? "Saving…" : "Save Job to Board"}
          </Button>
          <p className="text-center text-[11px] text-foreground/45 mt-3 leading-relaxed">
            Adds to <span className="font-medium text-foreground/60">My Jobs</span> · Reveals your match score
          </p>
        </motion.div>
      )}

      {authState === "saved" && (
        <motion.div
          key="boost-saved"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`${CARD} p-5`}
        >
          {/* Saved badge */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-[14px] font-semibold text-foreground leading-snug">
              {matchScore !== null ? "Your match score" : "Scoring your profile…"}
            </h3>
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 rounded-full px-2 py-0.5">
              <Check className="w-2.5 h-2.5" />
              Saved
            </span>
          </div>

          {/* Gauge */}
          <div className="flex flex-col items-center gap-1.5 mb-4">
            <YourScoreGauge isDark={isDark} score={matchScore} />
            <span className="text-[11px] text-foreground/50 font-medium tracking-tight">Your Score</span>
          </div>

          <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mb-3" />

          <Button
            asChild
            variant="outline"
            className="w-full transition-all duration-[160ms] active:scale-[0.97]"
          >
            <Link href="/jobs">
              Go to My Jobs
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
