import React from "react";

export default function Toggle({ onClick, value = false }) {
  return (
    <div class="toggle-container">
      <input
        type="checkbox"
        id="theme-toggle"
        class="toggle-input"
        onChange={onClick}
        checked={value}
      />
      <label for="theme-toggle" class="toggle-label">
        <div class="toggle-ball"></div>
      </label>
    </div>
  );
}
