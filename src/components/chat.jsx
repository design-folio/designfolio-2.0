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
  onComplete = () => {},
}) {
  const [show, setShow] = useState(delay == 0 ? true : false);
  const emptyDivRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set visibility state to true only once when the element is in view
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        root: null, // Use the viewport as the root
        rootMargin: "0px",
        threshold: 0.1, // Trigger when at least 10% of the element is visible
      }
    );

    if (emptyDivRef.current) {
      observer.observe(emptyDivRef.current);
    }

    // Clean up observer on component unmount
    return () => {
      if (emptyDivRef.current) {
        observer.unobserve(emptyDivRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    let timeout;
    if (isVisible) {
      timeout = setTimeout(() => {
        setShow(true);
        onComplete();
      }, delay);
    }

    return () => clearTimeout(timeout);
  }, [isVisible]);
  return (
    <div
      className={`flex flex-col min-w-min relative  max-w-[680px]  ${
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
      <div ref={emptyDivRef}></div>
    </div>
  );
}
