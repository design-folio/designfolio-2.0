import React from "react";
import { motion } from "motion/react";
import { Pencil } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";

function CanvasSkillsMarquee({ skills = [], isEditing }) {
  const { openSidebar } = useGlobalContext();

  if (skills.length === 0) return null;

  const repeatedSkills = [...skills, ...skills, ...skills, ...skills, ...skills];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.3 }}
      className="group/section relative w-full rounded-[26px] border border-[#E5D7C4] bg-white py-2 dark:border-white/10 dark:bg-[#2A2520]"
    >
      {isEditing && (
        <CanvasSectionControls>
          <CanvasSectionButton
            icon={<Pencil className="h-3.5 w-3.5" />}
            label="Edit Skills"
            onClick={() => openSidebar(sidebars.skills)}
          />
        </CanvasSectionControls>
      )}
      <div className="absolute top-0 bottom-0 left-0 z-10 w-12 rounded-l-[24px] bg-gradient-to-r from-white/80 to-transparent dark:from-[#2A2520]/80"></div>
      <div className="absolute top-0 right-0 bottom-0 z-10 w-12 rounded-r-[24px] bg-gradient-to-l from-white/80 to-transparent dark:from-[#2A2520]/80"></div>
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4 whitespace-nowrap"
          animate={{ x: [0, "-50%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
        >
          {repeatedSkills.map((skill, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-[12px] font-medium tracking-wider text-[#7A736C] uppercase dark:text-[#B5AFA5]">
                {skill.label}
              </span>
              <div className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l2 9 9 2-9 2-2 9-2-9-9-2 9-2 2-9z" />
                </svg>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasSkillsMarquee);
