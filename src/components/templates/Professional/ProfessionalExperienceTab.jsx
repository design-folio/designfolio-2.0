import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Pencil, Plus } from "lucide-react";
import { parseTiptapToWords } from "@/lib/tiptapUtils";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { SectionVisibilityButton } from "@/components/section";
import { ProfessionalRearrangeButton } from "./ProfessionalRearrangeButton";

function ExperienceDescription({ desc }) {
  const words = parseTiptapToWords(desc);
  if (!words.length) return null;

  return (
    <motion.p
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.015 } },
      }}
      initial="hidden"
      animate="show"
      className="font-jetbrains text-scaled-15 max-w-xl leading-relaxed break-words whitespace-normal"
      style={{ color: "var(--tiptap-work-paragraph, #7a736c)" }}
    >
      {words.map((word, wordIndex) => {
        if (word.length === 1 && word[0].isBreak) return <br key={`br-${wordIndex}`} />;
        return (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.map((c, charIndex) => {
              let cls = "inline-block";
              if (c.bold) cls += " font-bold";
              if (c.italic) cls += " italic";
              if (c.underline) cls += " underline";
              if (c.strike) cls += " line-through";
              return (
                <motion.span
                  key={charIndex}
                  variants={{
                    hidden: { opacity: 0, filter: "blur(4px)", y: 4 },
                    show: { opacity: 1, filter: "blur(0px)", y: 0 },
                  }}
                  transition={{ duration: 0.2 }}
                  className={cls}
                  style={
                    c.highlight
                      ? {
                          backgroundColor: "#f9daa3",
                          borderRadius: "0.125rem",
                          padding: "0.125rem 0",
                          color: "black",
                        }
                      : undefined
                  }
                >
                  {c.ch}
                </motion.span>
              );
            })}
            {wordIndex < words.length - 1 && !words[wordIndex + 1]?.[0]?.isBreak && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </motion.p>
  );
}

function ExperienceItem({ exp, isExpanded, onToggle, isEditing, onEdit }) {
  return (
    <div className="group relative -mx-4 border-b border-[#D5D0C6] px-4 transition-colors last:border-0 hover:bg-[#DED9CE]/30 md:-mx-6 md:px-6 dark:border-[#3A352E] dark:hover:bg-white/[0.02]">
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-100 transition-opacity md:right-6 md:opacity-0 md:group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(exp);
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer flex-col gap-2 py-5 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.span
            animate={{ rotate: isExpanded ? 45 : 0 }}
            className="text-scaled-18 flex h-4 w-4 shrink-0 items-center justify-center leading-none font-light text-[#1A1A1A] transition-colors dark:text-[#F0EDE7]"
          >
            +
          </motion.span>
          <span className="font-jetbrains text-scaled-14 font-medium tracking-wide text-[#1A1A1A] uppercase dark:text-[#F0EDE7]">
            <span className="mr-2 text-[#7A736C] dark:text-[#9E9893]">{exp.startYear} /</span>
            {exp.company}
          </span>
        </div>
        <span className="font-jetbrains text-scaled-14 ml-8 tracking-wider text-[#7A736C] uppercase transition-colors group-hover:text-[#1A1A1A] sm:ml-0 dark:text-[#9E9893] dark:group-hover:text-[#F0EDE7]">
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
            <div className="pr-4 pb-6 pl-12 sm:pr-0">
              <ExperienceDescription desc={exp.description} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfessionalExperienceTab({ isEditing, experiences, onEditExperience, onAddExperience }) {
  const { openSidebar } = useGlobalContext();
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <div className="group/section px-4 pb-20 md:px-6">
      {isEditing && (
        <div className="-mx-4 mb-2 flex items-center justify-end gap-2 border-b border-[#D5D0C6] px-1 py-2 md:-mx-6 dark:border-[#3A352E]">
          {experiences.length >= 2 && (
            <ProfessionalRearrangeButton
              onClick={() => openSidebar(sidebars.sortWorks)}
              title="Rearrange experience"
              tooltipText="Rearrange"
            />
          )}
          <SectionVisibilityButton
            sectionId="works"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border-[#D5D0C6] bg-[#EFECE6] hover:bg-[#E5E0D8] dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:hover:bg-[#2A2520]"
          />
        </div>
      )}
      <div className="space-y-0">
        {experiences.map((exp, index) => (
          <ExperienceItem
            key={exp._id || index}
            exp={exp}
            index={index}
            isExpanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            isEditing={isEditing}
            onEdit={onEditExperience}
          />
        ))}

        {isEditing && (
          <div className="mt-4 border-t border-dashed border-[#D5D0C6]/50 pt-6 dark:border-[#3A352E]/50">
            <button
              onClick={onAddExperience}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#D5D0C6] bg-black/[0.02] py-4 text-[#7A736C] transition-all hover:border-[#1A1A1A] hover:bg-black/[0.04] hover:text-[#1A1A1A] dark:border-[#3A352E] dark:bg-white/[0.02] dark:text-[#9E9893] dark:hover:border-[#F0EDE7] dark:hover:bg-white/[0.04] dark:hover:text-[#F0EDE7]"
            >
              <Plus className="h-4 w-4" />
              <span className="font-jetbrains text-scaled-13 font-medium tracking-wider uppercase">
                Add New Experience
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProfessionalExperienceTab);
