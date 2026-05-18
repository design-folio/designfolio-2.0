import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

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
 */
export function ConicButton({ onClick, disabled = false, children, className = "" }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [hovered, setHovered] = useState(false);

  useEffect(() => { injectKeyframes(); }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        borderRadius: 50,
        padding: "2px",
        background: isDark
          ? "conic-gradient(from var(--rgb-angle, 0deg), #ffffff 0deg, #d0ccc6 6deg, #706c68 18deg, #302e2b 32deg, #1c1916 60deg, #1c1916 300deg, #302e2b 328deg, #706c68 342deg, #d0ccc6 354deg, #ffffff 360deg)"
          : "conic-gradient(from var(--rgb-angle, 0deg), #ffffff 0deg, #c8c4be 6deg, #686460 18deg, #282522 32deg, #1c1916 60deg, #1c1916 300deg, #282522 328deg, #686460 342deg, #c8c4be 354deg, #ffffff 360deg)",
        animation: "rotate-rgb-gradient 3s linear infinite",
        cursor: disabled ? "default" : "pointer",
        transform: hovered && !disabled ? "scale(1.025)" : "scale(1)",
        boxShadow: hovered && !disabled
          ? "0 0 0 1px rgba(250,95,75,0.3), 0 4px 20px rgba(250,95,75,0.35)"
          : "0 0 0 1px rgba(250,95,75,0.15), 0 4px 14px rgba(250,95,75,0.18)",
        transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          width: "100%",
          background: hovered && !disabled ? "#f8614e" : "#FA5F4B",
          borderRadius: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px 0",
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
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
