import { useState, useEffect } from "react";

const STYLE_ID = "rotating-gradient-btn-kf";

const KEYFRAMES = `
  @property --rgb-angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }
  @keyframes rotate-rgb-gradient {
    to { --rgb-angle: 360deg; }
  }
`;

function injectKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

/**
 * A pill-shaped button with a rotating conic-gradient border.
 *
 * Props:
 *   onClick        — click handler
 *   disabled       — disables interaction and dims the button
 *   isDark         — drives light/dark color variants
 *   children       — button content
 *   className      — extra classes on the outer wrapper
 *   style          — extra styles on the outer wrapper
 */
export function RotatingGradientButton({
  onClick,
  disabled = false,
  isDark = false,
  children,
  className = "",
  style: extraStyle = {},
}) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => { injectKeyframes(); }, []);

  const outerBg = isDark
    ? `conic-gradient(from var(--rgb-angle, 0deg), #ffffff 0deg, #d0ccc6 6deg, #706c68 18deg, #302e2b 32deg, #1c1916 60deg, #1c1916 300deg, #302e2b 328deg, #706c68 342deg, #d0ccc6 354deg, #ffffff 360deg)`
    : `conic-gradient(from var(--rgb-angle, 0deg), #ffffff 0deg, #c8c4be 6deg, #686460 18deg, #282522 32deg, #1c1916 60deg, #1c1916 300deg, #282522 328deg, #686460 342deg, #c8c4be 354deg, #ffffff 360deg)`;

  const boxShadow = hovered && !disabled
    ? isDark
      ? "0 0 0 1px hsl(20,10%,26%), 0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)"
      : "0 0 0 1px hsl(20,10%,60%), 0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.70)"
    : isDark
      ? "0 0 0 1px hsl(20,10%,22%), inset 0 1px 0 rgba(255,255,255,0.06)"
      : "0 0 0 1px hsl(20,10%,72%), inset 0 1px 0 rgba(255,255,255,0.5)";

  const innerBg = isDark
    ? hovered ? "hsl(46,35%,97%)" : "hsl(46,29%,94%)"
    : hovered ? "hsl(20,12%,18%)" : "hsl(20,10%,15%)";

  const innerColor = isDark ? "hsl(20,10%,10%)" : "hsl(46,29%,94%)";

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => e.key === "Enter" && !disabled && onClick?.()}
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
        ...extraStyle,
      }}
    >
      <div
        style={{
          background: innerBg,
          borderRadius: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "8px 0",
          fontSize: 13,
          fontWeight: 600,
          color: innerColor,
          transition: "background 200ms ease",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
