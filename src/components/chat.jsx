import React, { useEffect, useRef, useState, startTransition } from "react";
import ChatBubble from "./chatBubble";
import { motion } from "motion/react";
import LeftBubble from "../../public/assets/svgs/chat-bubble-left.svg";
import RightBubble from "../../public/assets/svgs/chat-bubble-right.svg";

export default function Chat({
  direction = "left",
  children,
  delay = 0,
  className = "",
  onComplete = () => {},
}) {
  const [show, setShow] = useState(delay === 0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  // Reveal on mount after delay (no IntersectionObserver – works on both pages and avoids zero-height div)
  useEffect(() => {
    if (delay === 0) {
      startTransition(() => setShow(true));
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
      className={`relative flex w-full max-w-[680px] min-w-min flex-1 flex-col ${
        direction == "left" ? " mr-auto" : " ml-auto"
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
        className={`${
          direction == "left"
            ? "bg-template-text-left-bg-color text-template-text-left-text-color mr-auto"
            : "bg-template-text-right-bg-color text-template-text-right-text-color ml-auto"
        } rounded-[24px] p-4 break-words ${className}`}
      >
        {show ? children : <ChatBubble className="cursor-pointer" color={"#000"} />}

        {direction == "left" ? (
          <LeftBubble
            className="text-template-text-left-bg-color absolute bottom-0 left-[-10px]"
            style={{ zIndex: "-1" }}
          />
        ) : (
          <RightBubble
            className="text-template-text-left-bg-color absolute right-[-10px] bottom-0"
            style={{ zIndex: "-1" }}
          />
        )}
      </motion.div>
    </div>
  );
}
