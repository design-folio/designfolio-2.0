import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { extractText } from "./spotlight-utils";

function AnimatedWord({ word, wordIndex, isLast }) {
  return (
    <span className="inline-block whitespace-nowrap">
      {word.split("").map((char, charIndex) => (
        <motion.span
          key={charIndex}
          variants={{
            hidden: { opacity: 0, filter: "blur(4px)", y: 4 },
            show: { opacity: 1, filter: "blur(0px)", y: 0 },
          }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
      {!isLast && <span className="inline-block">&nbsp;</span>}
    </span>
  );
}

function ExperienceItem({
  exp,
  index,
  isExpanded,
  onToggle,
  isEditing,
  onEdit,
}) {
  const descriptionText = extractText(exp.description);

  return (
    <div className="group border-b border-[#D5D0C6] dark:border-[#3A352E] last:border-0 hover:bg-[#DED9CE]/30 dark:hover:bg-white/[0.02] transition-colors -mx-4 px-4 md:-mx-6 md:px-6 relative">
      {isEditing && (
        <div className="absolute top-4 right-4 md:right-6 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <button
        onClick={onToggle}
        className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between py-5 gap-2 sm:gap-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <motion.span
            animate={{ rotate: isExpanded ? 45 : 0 }}
            className="text-[#1A1A1A] dark:text-[#F0EDE7] font-light text-lg leading-none transition-colors w-4 h-4 flex items-center justify-center shrink-0"
          >
            +
          </motion.span>
          <span className="font-jetbrains text-[#1A1A1A] dark:text-[#F0EDE7] text-[14px] font-medium tracking-wide uppercase">
            <span className="text-[#7A736C] dark:text-[#9E9893] mr-2">
              {exp.startYear} /
            </span>
            {exp.company}
          </span>
        </div>
        <span className="font-jetbrains text-[#7A736C] dark:text-[#9E9893] text-[14px] uppercase tracking-wider group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7] transition-colors ml-8 sm:ml-0">
          {exp.role}
        </span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-12 pr-4 sm:pr-0">
              <motion.p
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.015 },
                  },
                }}
                initial="hidden"
                animate="show"
                className="font-jetbrains text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed max-w-xl"
              >
                {descriptionText.split(" ").map((word, wordIndex, arr) => (
                  <AnimatedWord
                    key={wordIndex}
                    word={word}
                    wordIndex={wordIndex}
                    isLast={wordIndex === arr.length - 1}
                  />
                ))}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpotlightExperienceTab({
  isEditing,
  experiences,
  onEditExperience,
  onAddExperience,
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <div className="px-4 md:px-6 pb-12 relative group/section">
      <div className="space-y-0">
        {experiences.map((exp, index) => (
          <ExperienceItem
            key={exp._id || index}
            exp={exp}
            index={index}
            isExpanded={expandedIndex === index}
            onToggle={() =>
              setExpandedIndex(expandedIndex === index ? null : index)
            }
            isEditing={isEditing}
            onEdit={onEditExperience}
          />
        ))}

        {isEditing && (
          <div className="pt-6 mt-4 border-t border-[#D5D0C6]/50 dark:border-[#3A352E]/50 border-dashed">
            <button
              onClick={onAddExperience}
              className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-[#D5D0C6] dark:border-[#3A352E] rounded-lg text-[#7A736C] dark:text-[#9E9893] hover:border-[#1A1A1A] dark:hover:border-[#F0EDE7] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-all bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
            >
              <Plus className="w-4 h-4" />
              <span className="font-jetbrains text-[13px] uppercase tracking-wider font-medium">
                Add New Experience
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(SpotlightExperienceTab);
