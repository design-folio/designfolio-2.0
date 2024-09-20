import React from "react";
import { motion } from "framer-motion";

const ProgressBar = ({
  progress,
  bg = "linear-gradient(to right, #FFB736, #F86845)",
}) => {
  // Ensure progress is between 0 and 100
  const validProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full bg-[#EFEFEF] dark:bg-[#1D1F27] rounded-full h-2">
      <motion.div
        className="h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${validProgress}%` }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundImage: bg,
        }}
      />
    </div>
  );
};

export default ProgressBar;
