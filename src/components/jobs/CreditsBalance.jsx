import { useState, useEffect, useRef, useCallback, useId, startTransition } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { FlaskConical } from "lucide-react";
import { _getUserQuota, createDodoCheckout } from "@/network/get-request";
import { ConicButton } from "@/components/ui/ConicButton";
import { CreditsShopModal } from "./CreditsShopModal";
import { useGlobalContext } from "@/context/globalContext";

/* ── Keyframes injected once (pulse-dot) ──────────────────────────────── */
const KEYFRAMES = `
  @keyframes pulse-dot {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1;  }
  }
`;

/* ── Bubble animation ─────────────────────────────────────────────────── */
const BUBBLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  width: Math.random() * 12 + 4,
  height: Math.random() * 12 + 4,
  left: Math.random() * 95,
  duration: 2 + Math.random() * 3,
  delay: Math.random() * 4,
}));

function BadgeBubbles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-full">
      {BUBBLES.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-10px] block rounded-full bg-black/[0.15] dark:bg-white/[0.2]"
          style={{
            width: `${b.width}px`,
            height: `${b.height}px`,
            left: `${b.left}%`,
            animation: `bubble-rise ${b.duration}s ${b.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Colour palette ──────────────────────────────────────────────────── */
function palette(pct) {
  if (pct > 0.5)
    return {
      bright: "#b5f546",
      mid: "#4ade80",
      deep: "#166534",
      glow: "#22c55e",
      label: "#86efac",
    };
  if (pct > 0.2)
    return {
      bright: "#fde68a",
      mid: "#f59e0b",
      deep: "#92400e",
      glow: "#d97706",
      label: "#fcd34d",
    };
  return { bright: "#fca5a5", mid: "#ef4444", deep: "#7f1d1d", glow: "#dc2626", label: "#fca5a5" };
}

/* ── Polar helpers ───────────────────────────────────────────────────── */
function pt(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}
function arcPath(cx, cy, r, a1, a2) {
  const s = pt(cx, cy, r, a1);
  const e = pt(cx, cy, r, a2);
  const sw = (a2 - a1 + 360) % 360;
  if (sw < 0.1) return "";
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${sw > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

/* ── Gauge geometry ──────────────────────────────────────────────────── */
const A0 = 240;
const A1 = 120;
const SWEEP = 240;
const CX = 120;
const CY = 108;
const R = 82;
const SW = 19;
const VB_W = CX * 2;
const VB_H = CY + R * 0.5 + 16;

function Ticks({ startDeg, endDeg, color }) {
  const sweep = (endDeg - startDeg + 360) % 360;
  const n = 12;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const deg = startDeg + (i / (n - 1)) * sweep;
        const inner = pt(CX, CY, R - 3, deg);
        const outer = pt(CX, CY, R + 3, deg);
        return (
          <line
            key={i}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={color}
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.25"
          />
        );
      })}
    </>
  );
}

function LiquidGauge({ pct, remaining, limit, uid, isDark }) {
  const c = palette(pct);
  const filled_sw = SWEEP * Math.min(Math.max(pct, 0), 1);
  const filledEnd = (A0 + filled_sw) % 360;

  const track = arcPath(CX, CY, R, A0, A1);
  const filled = filled_sw > 0.5 ? arcPath(CX, CY, R, A0, filledEnd) : "";
  const empty = filled_sw < SWEEP - 0.5 ? arcPath(CX, CY, R, filledEnd, A1) : "";
  const capPt = filled && pct > 0.02 && pct < 0.99 ? pt(CX, CY, R, filledEnd) : null;

  const mv = useMotionValue(0);
  const sp = useSpring(mv, { stiffness: 50, damping: 18 });
  const [disp, setDisp] = useState(0);
  useEffect(() => sp.on("change", (v) => setDisp(Math.round(v))), [sp]);
  useEffect(() => {
    const t = setTimeout(() => mv.set(remaining), 120);
    return () => clearTimeout(t);
  }, [remaining, mv]);

  const scoreY = CY - 16;
  const labelY = CY + 16;

  const trackSurface = isDark ? "hsl(20,10%,14%)" : "rgba(215,210,203,0.90)";
  const scoreColor = isDark ? "hsl(46,29%,94%)" : "#1A1A1A";
  const labelColor = isDark ? "rgba(240,237,232,0.68)" : "rgba(26,26,26,0.62)";

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      style={{ display: "block", overflow: "visible", margin: "0 auto" }}
    >
      <defs>
        <linearGradient
          id={`fg-${uid}`}
          gradientUnits="userSpaceOnUse"
          x1={CX}
          y1={CY - R}
          x2={CX}
          y2={CY + R * 0.55}
        >
          <stop offset="0%" stopColor={c.bright} />
          <stop offset="40%" stopColor={c.mid} />
          <stop offset="100%" stopColor={c.deep} />
        </linearGradient>
        <linearGradient
          id={`gg-${uid}`}
          gradientUnits="userSpaceOnUse"
          x1={CX}
          y1={CY - R}
          x2={CX}
          y2={CY}
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter
          id={`af-${uid}`}
          x="-35%"
          y="-35%"
          width="170%"
          height="170%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={c.glow} floodOpacity="0.55" />
          <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor={c.glow} floodOpacity="0.20" />
        </filter>
        <filter id={`bf-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <path
        d={track}
        fill="none"
        stroke={trackSurface}
        strokeWidth={SW + 6}
        strokeLinecap="round"
      />

      {filled && (
        <motion.path
          d={filled}
          fill="none"
          stroke={c.glow}
          strokeWidth={SW + 4}
          strokeLinecap="round"
          style={{ filter: `url(#bf-${uid})`, opacity: 0.1 }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        />
      )}
      {filled && (
        <motion.path
          d={filled}
          fill="none"
          stroke={c.glow}
          strokeWidth={SW - 4}
          strokeLinecap="round"
          style={{ filter: `url(#af-${uid})`, opacity: 0.22 }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        />
      )}
      {filled && (
        <motion.path
          d={filled}
          fill="none"
          stroke={`url(#fg-${uid})`}
          strokeWidth={SW - 4}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        />
      )}
      {filled && (
        <motion.path
          d={filled}
          fill="none"
          stroke={`url(#gg-${uid})`}
          strokeWidth={SW - 4}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        />
      )}
      {filled && (
        <motion.path
          d={arcPath(CX, CY, R - (SW - 4) * 0.42, A0, filledEnd)}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.50)"}
          strokeWidth={1.2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      )}

      {capPt && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <circle
            cx={capPt.x}
            cy={capPt.y}
            r={SW * 0.42}
            fill={c.bright}
            opacity={0.25}
            style={{ filter: `blur(${SW * 0.3}px)` }}
          />
          <circle
            cx={capPt.x}
            cy={capPt.y}
            r={SW * 0.19}
            fill={c.bright}
            opacity={0.95}
            style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
          />
        </motion.g>
      )}

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <text
          x={CX}
          y={scoreY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={scoreColor}
          fontSize="38"
          fontWeight="700"
          style={{ userSelect: "none", letterSpacing: "-1.5px", fontFamily: "inherit" }}
        >
          {disp}
        </text>
      </motion.g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <text
          x={CX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={labelColor}
          fontSize="11"
          fontWeight="500"
          style={{
            userSelect: "none",
            letterSpacing: "1px",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
          }}
        >
          AI CREDITS LEFT
        </text>
      </motion.g>
    </svg>
  );
}

/* ── Feature breakdown rows ───────────────────────────────────────────── */
const JOB_FEATURES = [
  { key: "mockInterview", label: "Mock Interview" },
  { key: "jobScan", label: "Job Scan" },
  { key: "resumeCustomize", label: "Resume Tailor" },
  { key: "coverLetter", label: "Cover Letter" },
  { key: "fitAnalysis", label: "Fit Analysis" },
  { key: "scoutChat", label: "Scout Chat" },
];

function FeatureRow({ label, used, limit, topupLimit = 0, topupUsed = 0, isDark, idx }) {
  const totalLimit = (limit ?? 0) + (topupLimit ?? 0);
  const totalUsed = used + topupUsed;
  const totalLeft = totalLimit - totalUsed;
  const locked = totalLimit === 0;
  const barPct = locked ? 0 : Math.max(0, 1 - totalUsed / totalLimit);

  const labelColor = isDark ? "rgba(240,237,232,0.82)" : "rgba(26,26,26,0.80)";
  const countColor = isDark ? "rgba(240,237,232,0.60)" : "rgba(26,26,26,0.55)";
  const trackColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.13)";
  const fillColor = isDark ? "rgba(255,255,255,0.72)" : "rgba(26,26,26,0.62)";
  const dimColor = isDark ? "rgba(181,175,165,0.3)" : "rgba(122,115,108,0.35)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05 + idx * 0.04, duration: 0.22 }}
      style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: locked ? dimColor : labelColor,
          whiteSpace: "nowrap",
          minWidth: 84,
        }}
      >
        {label}
      </span>
      <div
        style={{ flex: 1, height: 3, borderRadius: 99, overflow: "hidden", background: trackColor }}
      >
        {!locked && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barPct * 100}%` }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.12 + idx * 0.06 }}
            style={{ height: "100%", borderRadius: 99, background: fillColor }}
          />
        )}
      </div>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          color: locked ? dimColor : countColor,
          whiteSpace: "nowrap",
          minWidth: 28,
          textAlign: "right",
          letterSpacing: "-0.2px",
        }}
      >
        {locked ? "—" : `${totalLeft} Left`}
      </span>
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export function CreditsBalance({ refreshKey = 0 }) {
  const [quota, setQuota] = useState(null);
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const containerRef = useRef(null);
  const uid = useId().replace(/:/g, "");

  const { userDetails, setShowUpgradeModal } = useGlobalContext();
  const isPro = !!userDetails?.pro;

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  useEffect(() => {
    let cancelled = false;
    _getUserQuota()
      .then((res) => {
        if (!cancelled) setQuota(res.data?.quota ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Aggregate finite-limit job features only — unlimited (null limit) are excluded from the gauge total
  const { totalRemaining, totalLimit } = JOB_FEATURES.reduce(
    (acc, { key }) => {
      const base = quota?.[key] ?? { limit: 0, used: 0 };
      const topup = quota?.topup?.[key] ?? { limit: 0, used: 0 };
      if (base.limit === null) return acc; // unlimited — skip from finite aggregate
      acc.totalLimit += (base.limit ?? 0) + (topup.limit ?? 0);
      acc.totalRemaining += Math.max(
        0,
        (base.limit ?? 0) - base.used + ((topup.limit ?? 0) - topup.used)
      );
      return acc;
    },
    { totalRemaining: 0, totalLimit: 0 }
  );

  const displayTotal = totalLimit > 0 ? totalLimit : 0;
  const balance = quota !== null ? totalRemaining : null;
  const pct = displayTotal > 0 && balance !== null ? Math.min(1, balance / displayTotal) : 0;

  const handleBuy = useCallback(async () => {
    if (buying) return;
    setBuying(true);
    try {
      const res = await createDodoCheckout("topup");
      window.location.href = res.data.checkoutUrl;
    } catch {
      setBuying(false);
    }
  }, [buying]);

  const card = isDark
    ? {
        background: "linear-gradient(160deg, hsl(20,10%,13%) 0%, hsl(20,10%,10%) 100%)",
        border: "1px solid hsl(20,10%,20%)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.18)",
        gloss: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
      }
    : {
        background: "linear-gradient(160deg, #FDFCFB 0%, #F0EDE7 100%)",
        border: "1px solid rgba(26,26,26,0.10)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        gloss: "linear-gradient(90deg, transparent, rgba(255,255,255,0.70), transparent)",
      };

  const divColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(26,26,26,0.07)";
  const descColor = isDark ? "hsl(46,10%,60%)" : "rgba(26,26,26,0.45)";

  return (
    <div ref={containerRef} className="relative">
      <style>{KEYFRAMES}</style>

      {/* Badge trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
        className={`group text-foreground hover:bg-card hover:text-accent-foreground relative inline-flex h-9 cursor-pointer items-center gap-2 overflow-hidden rounded-full border-[#d4d0c4] px-4 text-sm font-medium transition-all select-none dark:border-[#38312e] ${
          open ? "bg-card text-accent-foreground border-2" : "border bg-[#EEECE7] dark:bg-[#1C1917]"
        }`}
      >
        <BadgeBubbles />
        <div className="pointer-events-none relative z-10 shrink-0">
          <FlaskConical className="h-3.5 w-3.5 opacity-70" />
        </div>
        <div className="pointer-events-none relative z-10 whitespace-nowrap">
          <span className="font-semibold">{balance ?? "…"}</span>
          <span className="ml-1 text-xs opacity-50">Credits</span>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(100%+10px)] right-0 z-50"
            style={{ width: 272 }}
          >
            <div
              style={{
                background: card.background,
                border: card.border,
                borderRadius: 22,
                boxShadow: card.boxShadow,
                padding: "20px 20px 18px",
                position: "relative",
                overflow: "visible",
              }}
            >
              {/* Top gloss streak */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "18%",
                  right: "18%",
                  height: 1,
                  background: card.gloss,
                  pointerEvents: "none",
                }}
              />

              {/* Gauge */}
              <div
                style={{
                  marginLeft: -20,
                  marginRight: -20,
                  marginTop: -20,
                  marginBottom: 8,
                  overflow: "visible",
                }}
              >
                <LiquidGauge
                  pct={pct}
                  remaining={balance ?? 0}
                  limit={displayTotal}
                  uid={uid}
                  isDark={isDark}
                />
              </div>

              {/* Per-feature breakdown — hide unlimited (null limit) features */}
              {quota && (
                <>
                  <div style={{ height: 1, background: divColor, marginBottom: 10 }} />
                  <div>
                    {JOB_FEATURES.filter(
                      ({ key }) => quota?.[key]?.limit !== null && (quota?.[key]?.limit ?? 0) > 0
                    ).map(({ key, label }, idx) => {
                      const base = quota?.[key] ?? { limit: 0, used: 0 };
                      const topup = quota?.topup?.[key] ?? { limit: 0, used: 0 };
                      return (
                        <FeatureRow
                          key={key}
                          label={label}
                          idx={idx}
                          used={base.used}
                          limit={base.limit}
                          topupUsed={topup.used}
                          topupLimit={topup.limit}
                          isDark={isDark}
                        />
                      );
                    })}
                  </div>
                  <div style={{ height: 1, background: divColor, margin: "2px 0 14px" }} />
                </>
              )}

              {/* CTA */}
              <ConicButton
                variant="mono"
                onClick={() => {
                  setOpen(false);
                  if (isPro) {
                    setShopOpen(true);
                  } else {
                    setShowUpgradeModal(true);
                  }
                }}
                disabled={buying}
                isDark={isDark}
              >
                Get more credits
              </ConicButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreditsShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        onBuy={handleBuy}
        buying={buying}
      />
    </div>
  );
}
