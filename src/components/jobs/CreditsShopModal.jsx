import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import {
  X,
  Zap,
  Clapperboard,
  FileText,
  PenLine,
  Crosshair,
  ScanSearch,
  MessageCircle,
} from "lucide-react";
import { ColorOrb } from "@/components/ui/color-orb";
import { ConicButton } from "@/components/ui/ConicButton";
import { _getProPlanDetails } from "@/network/get-request";

/* ── Feature metadata map ─────────────────────────────────────────────── */
const FEATURE_META = {
  mockInterview: {
    icon: Clapperboard,
    label: "Mock Interview",
    sub: "Full AI-powered interview session",
  },
  jobScan: { icon: ScanSearch, label: "Job Scan", sub: "Score & analyse a job listing" },
  resumeCustomize: {
    icon: FileText,
    label: "Resume Tailor",
    sub: "Rewrite your resume for a specific role",
  },
  coverLetter: {
    icon: PenLine,
    label: "Cover Letter",
    sub: "Generate a job-specific cover letter",
  },
  fitAnalysis: { icon: Crosshair, label: "Fit Analysis", sub: "Analyse your fit for a role" },
  scoutChat: {
    icon: MessageCircle,
    label: "Scout Chat",
    sub: "Deep insights on any job or company",
  },
};

const FEATURE_ORDER = [
  "mockInterview",
  "jobScan",
  "resumeCustomize",
  "coverLetter",
  "fitAnalysis",
  "scoutChat",
];

export function CreditsShopModal({ open, onClose, onBuy, buying = false }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [pack, setPack] = useState(null);

  useEffect(() => {
    if (!open || pack) return;
    _getProPlanDetails()
      .then((res) => {
        const topup = res.data?.jobTopup;
        if (topup) setPack(topup);
      })
      .catch(() => {});
  }, [open, pack]);

  const quantities = pack?.quantities ?? {};
  const amount = pack?.amount ?? 999;
  const symbol = pack?.currency === "USD" ? "$" : "₹";
  const totalUses = Object.values(quantities).reduce((s, v) => s + v, 0) || 0;

  // Build rows in a fixed order, skip any key not in FEATURE_META
  const rows = FEATURE_ORDER.filter((key) => FEATURE_META[key] && (quantities[key] ?? 0) > 0).map(
    (key) => ({ key, ...FEATURE_META[key], count: quantities[key] })
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Scrim */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-[400px] rounded-[28px] overflow-hidden"
            style={{
              background: isDark
                ? "linear-gradient(160deg, #252220 0%, #1C1917 100%)"
                : "linear-gradient(160deg, #FDFCFB 0%, #F0EDE7 100%)",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(26,26,26,0.09)",
              boxShadow: isDark
                ? "0 32px 80px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)"
                : "0 32px 80px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
            }}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.93, y: 12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-foreground/[0.07] hover:bg-foreground/[0.12] transition-colors text-foreground/50 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Header */}
            <div className="px-6 pt-7 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex flex-col items-start gap-2 mb-2 orb-always-active p-2 ">
                <ColorOrb dimension="28px" spinDuration={5} />
              </div>
              <h2 className="text-[20px] font-bold text-foreground leading-tight tracking-tight">
                Topup AI Credits
              </h2>
              <p className="text-[13px] text-foreground/45 mt-1 leading-relaxed">
                Extra credits for every Job AI feature — no subscription, pay only when you need
                more.
              </p>

              {/* Price row */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[34px] font-extrabold text-foreground tracking-tight leading-none">
                  {symbol}
                  {amount}
                </span>
                {totalUses > 0 && (
                  <>
                    <div className="h-7 w-px bg-foreground opacity-10 rounded-full" />
                    <span className="text-[14px] font-medium text-foreground opacity-50 leading-tight">
                      {totalUses} credits (no expiry)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Per-feature breakdown */}
            <div className="px-6 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30 mb-3">
                What&apos;s included
              </p>

              {rows.length > 0 ? (
                <div className="space-y-1">
                  {rows.map(({ key, icon: Icon, label, sub, count }) => (
                    <div key={key} className="flex items-center gap-3 py-1.5">
                      <div className="w-8 h-8 rounded-xl bg-foreground/[0.05] flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-foreground/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground/80 leading-none">
                          {label}
                        </div>
                        <div className="text-[11px] text-foreground/40 mt-0.5 leading-tight">
                          {sub}
                        </div>
                      </div>
                      <span className="flex items-center gap-0.5 bg-amber-100 dark:bg-amber-400/20 border border-amber-300/60 dark:border-amber-400/30 rounded-full px-1.5 py-0.5 shrink-0">
                        <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                          +{count}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Loading skeleton */
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-foreground/[0.05]" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-24 rounded bg-foreground/[0.07]" />
                        <div className="h-2.5 w-36 rounded bg-foreground/[0.05]" />
                      </div>
                      <div className="h-5 w-8 rounded-full bg-foreground/[0.06]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="px-5 pb-6 pt-1">
              <ConicButton onClick={onBuy} disabled={buying || !pack}>
                <Zap className="w-4 h-4 fill-white" />
                {buying ? "Opening checkout…" : pack ? `Buy pack ${symbol}${amount}` : "Loading…"}
              </ConicButton>
              <p className="text-center text-[11px] text-foreground opacity-30 mt-2.5">
                No subscription · Credits never expire
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
