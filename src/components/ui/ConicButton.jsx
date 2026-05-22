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
 */
export function ConicButton({ onClick, disabled = false, children, className = "" }) {
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
        background: "conic-gradient(from var(--rgb-angle, 0deg), #FFD580 0deg, #FF9A3C 40deg, #E8593A 90deg, #C0392B 150deg, #7A1A0A 180deg, #7A1A0A 200deg, #C0392B 240deg, #E8593A 290deg, #FF9A3C 330deg, #FFD580 360deg)",
        animation: "rotate-rgb-gradient 3s linear infinite",
        cursor: disabled ? "default" : "pointer",
        transform: hovered && !disabled ? "scale(1.025)" : "scale(1)",
        boxShadow: hovered && !disabled
          ? "0 0 0 1px rgba(232,89,58,0.3), 0 4px 20px rgba(232,89,58,0.35)"
          : "0 0 0 1px rgba(232,89,58,0.15), 0 4px 14px rgba(232,89,58,0.18)",
        transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          width: "100%",
          background: hovered && !disabled ? "#d44e30" : "#E8593A",
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
