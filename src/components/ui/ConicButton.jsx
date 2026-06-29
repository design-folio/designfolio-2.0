import { useState, useEffect } from "react";

const STYLE_ID = "conic-button-kf";
function injectKeyframes() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @property --rgb-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
    @keyframes rotate-rgb-gradient { to { --rgb-angle: 360deg; } }
  `;
  document.head.appendChild(style);
}

/**
 * Props:
 *   onClick   — click handler
 *   disabled  — disables interaction and dims the button
 *   children  — button label / content
 *   className — extra classes on the outer wrapper
 *   variant   — "orange" (default) | "mono"
 *   isDark    — dark mode flag, only used for variant="mono"
 */
export function ConicButton({
  onClick,
  disabled = false,
  children,
  className = "",
  variant = "orange",
  isDark = false,
}) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const isOrange = variant === "orange";

  const outerBg = isOrange
    ? // ? "conic-gradient(from var(--rgb-angle, 0deg), #ffffff 0deg, #d0ccc6 6deg, #706c68 18deg, #302e2b 32deg, #1c1916 60deg, #1c1916 300deg, #302e2b 328deg, #706c68 342deg, #d0ccc6 354deg, #ffffff 360deg)"
      "conic-gradient(from var(--rgb-angle, 0deg), #ffffff 0deg, #FFD580 6deg, #FF9A3C 18deg, #C0392B 32deg, #E8593A 60deg, #E8593A 300deg, #C0392B 328deg, #FF9A3C 342deg, #FFD580 354deg, #ffffff 360deg)"
    : isDark
      ? "conic-gradient(from var(--rgb-angle, 0deg), #ffffff 0deg, #d0ccc6 6deg, #706c68 18deg, #302e2b 32deg, #1c1916 60deg, #1c1916 300deg, #302e2b 328deg, #706c68 342deg, #d0ccc6 354deg, #ffffff 360deg)"
      : "conic-gradient(from var(--rgb-angle, 0deg), #ffffff 0deg, #c8c4be 6deg, #686460 18deg, #282522 32deg, #1c1916 60deg, #1c1916 300deg, #282522 328deg, #686460 342deg, #c8c4be 354deg, #ffffff 360deg)";

  const boxShadow = isOrange
    ? hovered && !disabled
      ? "0 0 0 1px rgba(232,89,58,0.3), 0 4px 20px rgba(232,89,58,0.35)"
      : "0 0 0 1px rgba(232,89,58,0.15), 0 4px 14px rgba(232,89,58,0.18)"
    : hovered && !disabled
      ? isDark
        ? "0 0 0 1px hsl(20,10%,26%), 0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)"
        : "0 0 0 1px hsl(20,10%,60%), 0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.70)"
      : isDark
        ? "0 0 0 1px hsl(20,10%,22%), inset 0 1px 0 rgba(255,255,255,0.06)"
        : "0 0 0 1px hsl(20,10%,72%), inset 0 1px 0 rgba(255,255,255,0.5)";

  const innerBg = isOrange
    ? hovered && !disabled
      ? "hsl(7, 100%, 55%)"
      : "hsl(7, 100%, 62%)"
    : isDark
      ? hovered
        ? "hsl(46,35%,97%)"
        : "hsl(46,29%,94%)"
      : hovered
        ? "hsl(20,12%,18%)"
        : "hsl(20,10%,15%)";

  const innerColor = isOrange ? "#fff" : isDark ? "hsl(20,10%,10%)" : "hsl(46,29%,94%)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        borderRadius: 50,
        padding: "2px",
        background: outerBg,
        animation: "rotate-rgb-gradient 3s linear infinite",
        cursor: disabled ? "default" : "pointer",
        transform: hovered && !disabled ? "scale(1.025)" : "scale(1)",
        boxShadow,
        transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          width: "100%",
          background: innerBg,
          borderRadius: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isOrange ? 8 : 6,
          padding: isOrange ? "12px 0" : "8px 0",
          fontSize: isOrange ? 14 : 13,
          fontWeight: isOrange ? 700 : 600,
          color: innerColor,
          border: "none",
          cursor: disabled ? "default" : "pointer",
          transition: "background 200ms ease",
        }}
      >
        {children}
      </button>
    </div>
  );
}
