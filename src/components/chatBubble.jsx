import React from "react";

export default function ChatBubble() {
  return (
    <svg
      className="w-[26px] h-6"
      viewBox="0 0 48 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="bubble fill-current" cx="8.03448" cy="3.0003" r="6" />
      <circle className="bubble fill-current" cx="24.0001" cy="3.0003" r="6" />
      <circle className="bubble fill-current" cx="38.9655" cy="3.0003" r="6" />
    </svg>
  );
}
