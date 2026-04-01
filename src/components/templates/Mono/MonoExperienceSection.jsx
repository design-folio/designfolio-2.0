import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { SectionVisibilityButton } from "@/components/section";
import { parseTiptapToWords } from "@/lib/tiptapUtils";

function ExperienceDescription({ desc }) {
  const words = parseTiptapToWords(desc);
  if (!words.length) return null;

  return (
    <motion.p
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.015 } } }}
      initial="hidden"
      animate="show"
      className="font-jetbrains text-[15px] leading-relaxed max-w-xl break-words whitespace-normal"
      style={{ color: "var(--tiptap-work-paragraph, #7a736c)" }}
    >
      {words.map((word, wordIndex) => {
        if (word.length === 1 && word[0].isBreak) return <br key={`br-${wordIndex}`} />;
        return (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {word.map((c, charIndex) => {
              let cls = "inline-block";
              if (c.bold)      cls += " font-bold";
              if (c.italic)    cls += " italic";
              if (c.underline) cls += " underline";
              if (c.strike)    cls += " line-through";
              return (
                <motion.span
                  key={charIndex}
                  variants={{ hidden: { opacity: 0, filter: "blur(4px)", y: 4 }, show: { opacity: 1, filter: "blur(0px)", y: 0 } }}
                  transition={{ duration: 0.2 }}
                  className={cls}
                  style={c.highlight ? { backgroundColor: "#f9daa3", borderRadius: "0.125rem", padding: "0.125rem 0", color: "black" } : undefined}
                >
                  {c.ch}
                </motion.span>
              );
            })}
            {wordIndex < words.length - 1 && !(words[wordIndex + 1]?.[0]?.isBreak) && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </motion.p>
  );
}

export default function MonoExperienceSection({ isEditing }) {
  const { userDetails, openSidebar, setSelectedWork } = useGlobalContext();
  const experiences = userDetails?.experiences || [];

  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleOpenWorkSidebar = useCallback(
    (exp) => {
      setSelectedWork?.(exp || null);
      openSidebar?.(sidebars.work);
    },
    [setSelectedWork, openSidebar],
  );

  return (
    <div className="px-5 md:px-8 py-8 relative group/section">
      {isEditing && (
        <div className="absolute top-4 right-4 transition-opacity z-10 flex gap-2">
          {experiences.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSidebar?.(sidebars.sortWorks)}
              className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenWorkSidebar(null)}
            className="h-8 w-8 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors opacity-100 md:opacity-0 md:group-hover/section:opacity-100"
          >
            <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
          <SectionVisibilityButton
            sectionId="works"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-[#2A2520] hover:bg-gray-50 dark:hover:bg-[#35302A]"
          />
        </div>
      )}

      <h2 className="text-[14px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-dm-mono uppercase tracking-widest mb-4">
        Experience
      </h2>

      {experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#7A736C] dark:text-[#9E9893]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">No experience yet</h3>
          <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
            Add your work experience to showcase your career journey.
          </p>
          {isEditing && (
            <Button
              onClick={() => handleOpenWorkSidebar(null)}
              className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm"
            >
              Add Experience
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-0">
          {experiences.map((exp, index) => (
            <div
              key={exp._id || index}
              className="group border-b border-[#D5D0C6] dark:border-[#3A352E] last:border-0 hover:bg-[#DED9CE]/30 dark:hover:bg-white/[0.02] transition-colors -mx-3 px-3 relative"
            >
              {isEditing && (
                <div className="absolute top-4 right-3 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-white dark:bg-[#2A2520] border-black/10 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                    onClick={(e) => { e.stopPropagation(); handleOpenWorkSidebar(exp); }}
                  >
                    <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              )}
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-2 sm:gap-4 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ rotate: expandedIndex === index ? 45 : 0 }}
                    className="text-[#1A1A1A] dark:text-[#F0EDE7] font-light text-lg leading-none w-4 h-4 flex items-center justify-center shrink-0"
                  >
                    +
                  </motion.span>
                  <span className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[14px] font-medium tracking-wide uppercase font-jetbrains">
                    <span className="text-[#7A736C] dark:text-[#9E9893] mr-2">
                      {exp.startYear} /
                    </span>
                    {exp.company}
                  </span>
                </div>
                <span className="font-jetbrains text-[#7A736C] dark:text-[#9E9893] text-[14px] uppercase tracking-wider group-hover:text-[#1A1A1A] dark:group-hover:text-[#F0EDE7] transition-colors ml-7 sm:ml-0">
                  {exp.role}
                </span>
              </button>
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-3 pl-7 pr-4">
                      <ExperienceDescription desc={exp.description} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
