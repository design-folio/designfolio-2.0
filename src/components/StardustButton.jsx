import React from "react";

export const StardustButton = ({
  children = "Launching Soon",
  onClick,
  className = "",
  ...props
}) => {
  const buttonStyle = {
    "--white": "#ffffff",
    "--bg": "linear-gradient(135deg, #f9d423 0%, #e8b923 50%, #d4a017 100%)",
    "--radius": "100px",
    outline: "none",
    cursor: "pointer !important",
    border: 0,
    position: "relative",
    borderRadius: "var(--radius)",
    background:
      "linear-gradient(135deg, #f9d423 0%, #e8b923 50%, #d4a017 100%)",
    transition: "all 0.2s ease",
    boxShadow: `
      inset 0 0.4rem 1rem rgba(255, 255, 255, 0.6),
      inset 0 -0.2rem 0.4rem rgba(100, 60, 10, 0.5),
      inset 0 -0.5rem 1rem rgba(255, 255, 200, 0.4),
      0 0.8rem 1.5rem rgba(212, 160, 23, 0.4),
      0 0.3rem 0.8rem rgba(100, 60, 10, 0.3)
    `,
  };

  const wrapStyle = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#4a2c0a",
    padding: "16px 24px",
    borderRadius: "inherit",
    position: "relative",
    overflow: "hidden",
    textShadow: "0 1px 2px rgba(255, 255, 255, 0.3)",
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

  const beforeAfterStyles = `
    .pearl-button .wrap::before,
    .pearl-button .wrap::after {
      content: "";
      position: absolute;
      transition: all 0.3s ease;
    }
    
    .pearl-button .wrap::before {
      left: -15%;
      right: -15%;
      bottom: 25%;
      top: -100%;
      border-radius: 50%;
      background-color: rgba(255, 255, 220, 0.4);
    }
    
    .pearl-button .wrap::after {
      left: 6%;
      right: 6%;
      top: 12%;
      bottom: 40%;
      border-radius: 22px 22px 0 0;
      box-shadow: inset 0 10px 8px -10px rgba(255, 255, 255, 0.8);
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(255, 255, 200, 0.3) 50%,
        rgba(0, 0, 0, 0) 100%
      );
    }
    
    .pearl-button .wrap p span:nth-child(2) {
      display: none;
    }
    
    .pearl-button:hover .wrap p span:nth-child(1) {
      display: none;
    }
    
    .pearl-button:hover .wrap p span:nth-child(2) {
      display: inline-block;
    }
    
    .pearl-button:hover {
      background: linear-gradient(135deg, #ffd93d 0%, #f0c829 50%, #e0b020 100%);
      box-shadow:
        inset 0 0.4rem 0.6rem rgba(255, 255, 255, 0.8),
        inset 0 -0.2rem 0.4rem rgba(100, 60, 10, 0.6),
        inset 0 -0.5rem 1rem rgba(255, 255, 220, 0.6),
        0 0.8rem 2rem rgba(249, 212, 35, 0.5),
        0 0.3rem 1rem rgba(100, 60, 10, 0.4);
    }
    
    .pearl-button:hover .wrap::before {
      transform: translateY(-5%);
    }
    
    .pearl-button:hover .wrap::after {
      opacity: 0.4;
      transform: translateY(5%);
    }
    
    .pearl-button:hover .wrap p {
      transform: translateY(-4%);
    }
    
    .pearl-button:active {
      transform: translateY(4px);
      background: linear-gradient(135deg, #e8c51d 0%, #d4a017 50%, #c09010 100%);
      box-shadow:
        inset 0 0.3rem 0.5rem rgba(255, 255, 255, 0.5),
        inset 0 -0.1rem 0.3rem rgba(100, 60, 10, 0.7),
        inset 0 -0.4rem 0.9rem rgba(255, 255, 200, 0.3),
        0 0.5rem 1rem rgba(212, 160, 23, 0.3),
        0 0.2rem 0.5rem rgba(100, 60, 10, 0.4);
    }
  `;

  return (
    <>
      <style>{beforeAfterStyles}</style>
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
