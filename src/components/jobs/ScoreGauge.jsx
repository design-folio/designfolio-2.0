import { useState, useEffect, useId } from "react";
import { motion } from "framer-motion";

// SVG geometry — 270° arc, 90° gap at the bottom
const SG_A0    = 225; // start deg (bottom-left)
const SG_A1    = 135; // end deg   (bottom-right)
const SG_SWEEP = 270;
const SG_CX    = 18;
const SG_CY    = 16;
const SG_R     = 12;
const SG_SW    = 3;
const SG_VBW   = SG_CX * 2;
const SG_VBH   = SG_CY + SG_R * 0.52 + 7;

function sgPt(deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: SG_CX + SG_R * Math.sin(rad), y: SG_CY - SG_R * Math.cos(rad) };
}

function sgArc(a1, a2) {
  const s = sgPt(a1);
  const e = sgPt(a2);
  const sw = ((a2 - a1) + 360) % 360;
  if (sw < 0.1) return "";
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${SG_R} ${SG_R} 0 ${sw > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

function sgPalette(score, isDark) {
  if (score >= 85) return { bright: "#4ade80", mid: isDark ? "#16a34a" : "#10b981" };
  if (score >= 70) return { bright: "#fde68a", mid: isDark ? "#ea580c" : "#f97316" };
  return { bright: "#fca5a5", mid: isDark ? "#b91c1c" : "#ef4444" };
}

export function getScoreColor(score, isDark) {
  if (isDark) {
    if (score >= 85) return { primary: "#059669", gradientEnd: "#34d399" };
    if (score >= 70) return { primary: "#ea580c", gradientEnd: "#fbbf24" };
    return { primary: "#dc2626", gradientEnd: "#f87171" };
  }
  if (score >= 85) return { primary: "#10b981", gradientEnd: "#34d399" };
  if (score >= 70) return { primary: "#f97316", gradientEnd: "#fbbf24" };
  return { primary: "#ef4444", gradientEnd: "#f87171" };
}

export function ScoreGauge({ value, isDark, scale = 1.55 }) {
  const uid = useId().replace(/:/g, "");
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const c = sgPalette(value, isDark);
  const filledSweep = SG_SWEEP * pct;
  const filledEnd   = (SG_A0 + filledSweep) % 360;
  const track  = sgArc(SG_A0, SG_A1);
  const filled = filledSweep > 0.5 ? sgArc(SG_A0, filledEnd) : "";
  const arcLen  = (filledSweep * Math.PI / 180) * SG_R;
  const trackSurface = isDark ? "hsl(20,8%,20%)" : "rgba(210,205,198,0.90)";
  const scoreColor   = isDark ? "rgba(240,237,232,0.88)" : "#1A1A1A";

  const [displayNum, setDisplayNum] = useState(0);
  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayNum(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const svgW = SG_VBW * scale;
  const svgH = SG_VBH * scale;

  return (
    <div style={{ flexShrink: 0 }}>
      <svg
        viewBox={`0 0 ${SG_VBW} ${SG_VBH}`}
        width={svgW}
        height={svgH}
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`sg-fg-${uid}`} gradientUnits="userSpaceOnUse"
            x1={SG_CX} y1={SG_CY - SG_R} x2={SG_CX} y2={SG_CY + SG_R * 0.5}>
            <stop offset="0%"   stopColor={c.bright} />
            <stop offset="100%" stopColor={c.mid}    />
          </linearGradient>
        </defs>

        {/* Track */}
        <path d={track} fill="none" stroke={trackSurface} strokeWidth={SG_SW} strokeLinecap="round" />

        {/* Filled arc */}
        {filled && (
          <motion.path
            d={filled}
            fill="none"
            stroke={`url(#sg-fg-${uid})`}
            strokeWidth={SG_SW}
            strokeLinecap="round"
            strokeDasharray={arcLen}
            initial={{ strokeDashoffset: arcLen }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />
        )}

        {/* Score value — counts up */}
        <text
          x={SG_CX}
          y={SG_CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={scoreColor}
          fontSize="7"
          fontWeight="700"
          style={{ userSelect: "none", letterSpacing: "-0.3px", fontFamily: "inherit" }}
        >
          {displayNum}
        </text>
      </svg>
    </div>
  );
}
