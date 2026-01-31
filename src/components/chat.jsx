import React, { useEffect, useRef, useState } from "react";
import ChatBubble from "./chatBubble";
import { motion } from "framer-motion";
import LeftBubble from "../../public/assets/svgs/chat-bubble-left.svg";
import RightBubble from "../../public/assets/svgs/chat-bubble-right.svg";

export default function Chat({
  direction = "left",
  children,
  delay = 0,
  className = "",
  onComplete = () => { },
}) {
  const [show, setShow] = useState(delay === 0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reveal on mount after delay (no IntersectionObserver – works on both pages and avoids zero-height div)
  useEffect(() => {
    if (delay === 0) {
      setShow(true);
      onCompleteRef.current();
      return;
    }
    const t = setTimeout(() => {
      setShow(true);
      onCompleteRef.current();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`flex flex-1 flex-col min-w-min relative  w-full max-w-[680px]  ${direction == "left" ? " mr-auto" : " ml-auto"
        }`}
    >
      <motion.div
        initial={{ x: direction == "left" ? -5 : 5, scale: 0.99, opacity: 0 }}
        animate={{ x: 0, scale: 1, opacity: 1 }}
        style={{
          transformOrigin: direction == "left" ? "left" : "right",
          zIndex: 1,
          wordBreak: "break-word",
        }}
        className={`${direction == "left"
          ? "bg-template-text-left-bg-color text-template-text-left-text-color mr-auto"
          : "bg-template-text-right-bg-color text-template-text-right-text-color ml-auto"
          } p-4 rounded-[24px] break-words ${className}`}
      >
        {show ? (
          children
        ) : (
          <ChatBubble className="cursor-pointer" color={"#000"} />
        )}

        {direction == "left" ? (
          <LeftBubble
            className="absolute bottom-0 left-[-10px] text-template-text-left-bg-color"
            style={{ zIndex: "-1" }}
          />
        ) : (
          <RightBubble
            className="absolute bottom-0 right-[-10px] text-template-text-left-bg-color"
            style={{ zIndex: "-1" }}
          />
        )}
      </motion.div>
    </div>
  );
}
