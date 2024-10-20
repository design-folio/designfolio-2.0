import React from "react";

export default function AnimatedLoading() {
  return (
    <svg
      className="w-[22px] h-6"
      viewBox="0 0 22 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="bounce"
        cx="3.03448"
        cy="3.0003"
        r="2.53448"
        fill="#FF553E"
      />
      <circle
        className="bounce"
        cx="11.0001"
        cy="3.0003"
        r="2.53448"
        fill="#FF553E"
      />
      <circle
        className="bounce"
        cx="18.9655"
        cy="3.0003"
        r="2.53448"
        fill="#FF553E"
      />
    </svg>
  );
}
