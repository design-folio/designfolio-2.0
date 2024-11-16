import React, { useEffect, useState } from "react";
import ChatBubble from "./chatBubble";
import { motion } from "framer-motion";
import LeftBubble from "../../public/assets/svgs/chat-bubble-left.svg";
import RightBubble from "../../public/assets/svgs/chat-bubble-right.svg";

export default function Chat({
  direction = "left",
  children,
  delay = 0,
  className = "",
  onComplete = () => {},
}) {
  const [show, setShow] = useState(delay == 0 ? true : false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
      onComplete();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <motion.div
      initial={{ x: direction == "left" ? -5 : 5, scale: 0.8, opacity: 0 }}
      animate={{ x: 0, scale: 1, opacity: 1 }}
      style={{
        transformOrigin: direction == "left" ? "bottom left" : "bottom right",
        zIndex: 1,
      }}
      className={`flex flex-col min-w-min relative  max-w-[680px]  ${
        direction == "left"
          ? "bg-template-text-left-bg-color text-template-text-left-text-color mr-auto"
          : "bg-template-text-right-bg-color text-template-text-right-text-color ml-auto"
      } p-4 rounded-[24px] ${className}`}
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
  );
}
