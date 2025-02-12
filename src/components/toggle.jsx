import React from "react";

export default function Toggle({ onClick, value = false }) {
  return (
    <div className="toggle-container">
      <input
        type="checkbox"
        id="theme-toggle"
        className="toggle-input"
        onChange={onClick}
        checked={value}
      />
      <label htmlFor="theme-toggle" className="toggle-label">
        <div className="toggle-ball"></div>
      </label>
    </div>
  );
}
