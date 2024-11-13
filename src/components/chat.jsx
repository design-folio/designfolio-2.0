import React, { useEffect, useState } from "react";
import ChatBubble from "./chatBubble";
import { motion } from "framer-motion";
import LeftBubble from "../../public/assets/svgs/chat-bubble-left.svg";

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
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.5,
        duration: 0.1,
      }}
      style={{
        transformOrigin: direction == "left" ? "bottom left" : "bottom right",
      }}
      className={`flex flex-col min-w-min relative z-10 max-w-[680px] ${
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
        <img
          src="/assets/svgs/chat-bubble-right.svg"
          alt="left bubble"
          className="absolute bottom-0 right-[-10px]"
          style={{ zIndex: "-1" }}
        />
      )}
    </motion.div>
  );
}
