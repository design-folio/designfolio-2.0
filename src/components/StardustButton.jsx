import React from "react";

export const StardustButton = ({
  children = "Launching Soon",
  onClick,
  className = "",
  size = "default",
  ...props
}) => {
  const isCompact = size === "sm";
  const buttonStyle = {
    "--white": "#ffffff",
    "--bg": "linear-gradient(135deg, #f9d423 0%, #e8b923 50%, #d4a017 100%)",
    "--radius": "100px",
    outline: "none",
    cursor: "pointer",
    border: 0,
    position: "relative",
    borderRadius: "var(--radius)",
    background: "linear-gradient(135deg, #f9d423 0%, #e8b923 50%, #d4a017 100%)",
    transition: "all 0.2s ease",
    // boxShadow: `
    //   inset 0 0.4rem 1rem rgba(255, 255, 255, 0.6),
    //   inset 0 -0.2rem 0.4rem rgba(100, 60, 10, 0.5),
    //   inset 0 -0.5rem 1rem rgba(255, 255, 200, 0.4),
    //   0 0.8rem 1.5rem rgba(212, 160, 23, 0.4),
    //   0 0.3rem 0.8rem rgba(100, 60, 10, 0.3)
    // `,
  };

  const wrapStyle = {
    fontSize: isCompact ? "12px" : "16px",
    fontWeight: 700,
    color: "#4a2c0a",
    padding: isCompact ? "8px 14px" : "16px 24px",
    borderRadius: "inherit",
    position: "relative",
    overflow: "hidden",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.3)",
    pointerEvents: "none",
  };

  const pStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
    transition: "all 0.2s ease",
    transform: "translateY(2%)",
    maskImage: "linear-gradient(to bottom, #4a2c0a 50%, transparent)",
  };

  return (
    <>
      <button
        className={`pearl-button cursor-pointer ${className}`}
        style={buttonStyle}
        onClick={onClick}
        {...props}
      >
        <div className="wrap" style={wrapStyle}>
          <p style={pStyle}>
            <span>✧</span>
            <span>✦</span>
            {children}
          </p>
        </div>
      </button>
    </>
  );
};
