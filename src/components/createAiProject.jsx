import React from "react";
import { motion } from "framer-motion";
import AiIcon from "../../public/assets/svgs/ai.svg";
import Text from "./text";
import Button from "./button";
export default function CreateAiProject() {
  const variants = {
    hidden: { x: "100%" },
    visible: { x: "0%" },
  };

  return (
    <motion.div
      className="bg-modal-bg-color h-[95%] w-[602px] fixed top-[2.25%] right-4 flex flex-col rounded-2xl"
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <header className="p-4 text-lg font-bold">
        <div className="flex items-center gap-4">
          <Button
            icon={
              <AiIcon className="text-secondary-btn-text-color w-[22px] h-[22px]" />
            }
          />
          <Text size="p-small">Write using AI</Text>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        {/* This is the scrollable body */}
        <div style={{ height: "200px" }}>
          {/* Example content */}
          <p>Scrollable content goes here...</p>
          <p>More content...</p>
          <p>Even more content...</p>
          <p>Keep adding content...</p>
          <p>Last bit of content...</p>
          <p>Scrollable content goes here...</p>
          <p>More content...</p>

          <p>Last bit of content...</p>
          {/* Add more lines to see scrolling effect */}
        </div>
      </div>
      <footer className="bg-footer-bg-color p-4 text-sm">Footer</footer>
    </motion.div>
  );
}
