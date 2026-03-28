import React from "react";
import { motion } from "framer-motion";

function CanvasSkillsMarquee({ skills = [] }) {
  if (skills.length === 0) return null;

  const repeatedSkills = [
    ...skills,
    ...skills,
    ...skills,
    ...skills,
    ...skills,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.3 }}
      className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 py-2 overflow-hidden relative w-full"
    >
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/80 dark:from-[#2A2520]/80 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 dark:from-[#2A2520]/80 to-transparent z-10"></div>
      <motion.div
        className="flex gap-4 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ ease: "linear", duration: 20, repeat: Infinity }}
      >
        {repeatedSkills.map((skill, index) => (
          <div key={index} className="flex gap-4 items-center">
            <span className="text-[#7A736C] dark:text-[#B5AFA5] font-medium text-[12px] uppercase tracking-wider">
              {skill.label}
            </span>
            <div className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
              </svg>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default React.memo(CanvasSkillsMarquee);
