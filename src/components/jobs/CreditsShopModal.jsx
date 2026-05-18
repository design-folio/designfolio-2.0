import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { X, Zap, Clapperboard, FileText, PenLine, Crosshair, BookOpen } from "lucide-react";
import { ColorOrb } from "@/components/ui/color-orb";
import { ConicButton } from "@/components/ui/ConicButton";
import { _getProPlanDetails } from "@/network/get-request";

const CREDIT_ACTIONS = [
  { icon: Clapperboard, label: "Mock interview",              sub: "Practice with a real AI interviewer" },
  { icon: FileText,     label: "Tailor resume",               sub: "Rewrite your resume for this specific role" },
  { icon: PenLine,      label: "Cover letter",                sub: "Generate a job-specific cover letter" },
  { icon: Crosshair,    label: "Scout AI chat",               sub: "Get deep insights on any job or company" },
  { icon: BookOpen,     label: "Write / Analyze Case studies", sub: "Draft or critique design case studies" },
];

export function CreditsShopModal({ open, onClose, onBuy, buying = false }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [pack, setPack] = useState(null);

  useEffect(() => {
    if (!open || pack) return;
    _getProPlanDetails()
      .then((res) => {
        const topup = res.data?.creditTopups?.[0];
        if (topup) setPack(topup);
      })
      .catch(() => {});
  }, [open]);

  const credits = pack?.credits ?? 50;
  const amount  = pack?.amount  ?? 299;
  const symbol  = pack?.currency === "USD" ? "$" : "₹";

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
            initial={{ scale: 0.90, y: 20, opacity: 0 }}
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

            {/* Header band */}
            <div className="px-6 pt-7 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
              {/* Animated color orb */}
              <div className="mb-4 orb-always-active flex items-center">
                <ColorOrb dimension="28px" spinDuration={5} />
              </div>

              <h2 className="text-[20px] font-bold text-foreground leading-tight tracking-tight">Top up AI Credits</h2>
              <p className="text-[13px] text-foreground/45 mt-1 leading-relaxed">
                Credits power every AI action in Designfolio — no subscription, pay only when you need more.
              </p>

              {/* Price row */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[34px] font-extrabold text-foreground tracking-tight leading-none">{symbol}{amount}</span>
                <div className="h-7 w-px bg-foreground/10 rounded-full" />
                <span className="text-[14px] font-medium text-foreground/50 leading-tight">{credits} credits</span>
              </div>
            </div>

            {/* What credits do */}
            <div className="px-6 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30 mb-3">What you can do</p>
              <div className="space-y-2.5">
                {CREDIT_ACTIONS.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-foreground/[0.05] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-foreground/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-foreground/80 leading-none">{label}</div>
                      <div className="text-[11px] text-foreground/40 mt-0.5 leading-tight">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-6 pt-2">
              <ConicButton onClick={onBuy} disabled={buying}>
                <Zap className="w-4 h-4 fill-white" />
                {buying ? "Opening checkout…" : `Buy ${credits} Credits — ${symbol}${amount}`}
              </ConicButton>
              <p className="text-center text-[11px] text-foreground/30 mt-2.5">No subscription · Credits never expire</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
