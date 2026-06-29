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
            className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-[28px]"
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
              className="bg-foreground/[0.07] hover:bg-foreground/[0.12] text-foreground/50 hover:text-foreground absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Header */}
            <div className="border-b border-black/[0.06] px-6 pt-7 pb-5 dark:border-white/[0.06]">
              <div className="orb-always-active mb-2 flex flex-col items-start gap-2 p-2">
                <ColorOrb dimension="28px" spinDuration={5} />
              </div>
              <h2 className="text-foreground text-[20px] leading-tight font-bold tracking-tight">
                Topup AI Credits
              </h2>
              <p className="text-foreground/45 mt-1 text-[13px] leading-relaxed">
                Extra credits for every Job AI feature — no subscription, pay only when you need
                more.
              </p>

              {/* Price row */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-foreground text-[34px] leading-none font-extrabold tracking-tight">
                  {symbol}
                  {amount}
                </span>
                {totalUses > 0 && (
                  <>
                    <div className="bg-foreground h-7 w-px rounded-full opacity-10" />
                    <span className="text-foreground text-[14px] leading-tight font-medium opacity-50">
                      {totalUses} credits (no expiry)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Per-feature breakdown */}
            <div className="px-6 py-4">
              <p className="text-foreground/30 mb-3 text-[10px] font-semibold tracking-[0.1em] uppercase">
                What&apos;s included
              </p>

              {rows.length > 0 ? (
                <div className="space-y-1">
                  {rows.map(({ key, icon: Icon, label, sub, count }) => (
                    <div key={key} className="flex items-center gap-3 py-1.5">
                      <div className="bg-foreground/[0.05] flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                        <Icon className="text-foreground/40 h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground/80 text-[13px] leading-none font-medium">
                          {label}
                        </div>
                        <div className="text-foreground/40 mt-0.5 text-[11px] leading-tight">
                          {sub}
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-amber-300/60 bg-amber-100 px-1.5 py-0.5 dark:border-amber-400/30 dark:bg-amber-400/20">
                        <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        <span className="text-[10px] font-semibold text-amber-600 tabular-nums dark:text-amber-400">
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
                    <div key={i} className="flex animate-pulse items-center gap-3">
                      <div className="bg-foreground/[0.05] h-8 w-8 rounded-xl" />
                      <div className="flex-1 space-y-1.5">
                        <div className="bg-foreground/[0.07] h-3 w-24 rounded" />
                        <div className="bg-foreground/[0.05] h-2.5 w-36 rounded" />
                      </div>
                      <div className="bg-foreground/[0.06] h-5 w-8 rounded-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="px-5 pt-1 pb-6">
              <ConicButton onClick={onBuy} disabled={buying || !pack}>
                <Zap className="h-4 w-4 fill-white" />
                {buying ? "Opening checkout…" : pack ? `Buy pack ${symbol}${amount}` : "Loading…"}
              </ConicButton>
              <p className="text-foreground mt-2.5 text-center text-[11px] opacity-30">
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
