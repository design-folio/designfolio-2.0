import { useState, useCallback, useEffect, useMemo, Fragment, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";
import { sidebars } from "@/lib/constant";
import { SectionVisibilityButton } from "@/components/section";
import { parseTiptapToWords } from "@/lib/tiptapUtils";
import { MonoRearrangeButton } from "./MonoRearrangeButton";

function ExperienceDescription({ desc }) {
  const words = useMemo(() => parseTiptapToWords(desc), [desc]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    startTransition(() => setVisibleCount(0));
    if (!words.length) return;
    let count = 0;
    // 75ms ≈ 5 chars × 15ms — matches the original char stagger pace
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= words.length) clearInterval(interval);
    }, 75);
    return () => clearInterval(interval);
  }, [words]);

  if (!words.length) return null;

  return (
    <p
      className="font-jetbrains text-scaled-15 leading-relaxed wrap-break-word whitespace-normal"
      style={{ color: "var(--tiptap-work-paragraph, #7a736c)" }}
    >
      {words.slice(0, visibleCount).map((word, wordIndex) => {
        if (word.length === 1 && word[0].isBreak) return <br key={wordIndex} />;
        return (
          <Fragment key={wordIndex}>
            <motion.span
              className="inline-block whitespace-nowrap"
              initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {word.map((c, charIndex) => {
                let cls = "inline-block";
                if (c.bold) cls += " font-bold";
                if (c.italic) cls += " italic";
                if (c.underline) cls += " underline";
                if (c.strike) cls += " line-through";
                return (
                  <span
                    key={charIndex}
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
                  </span>
                );
              })}
            </motion.span>
            {wordIndex < words.length - 1 && !words[wordIndex + 1]?.[0]?.isBreak && " "}
          </Fragment>
        );
      })}
    </p>
  );
}

export default function MonoExperienceSection({ isEditing, hasWallpaper = true }) {
  const { userDetails, openSidebar, openNewWork, setSelectedWork } = useGlobalContext();
  const experiences = userDetails?.experiences || [];

  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleOpenWorkSidebar = useCallback(
    (exp) => {
      if (exp) {
        setSelectedWork(exp);
        openSidebar(sidebars.work);
      } else {
        openNewWork();
      }
    },
    [setSelectedWork, openSidebar, openNewWork]
  );

  if (!isEditing && experiences.length === 0) return null;

  return (
    <div
      className={cn(
        "group/section relative px-6 py-10 md:px-10",
        hasWallpaper && "bg-white dark:bg-[#1A1A1A]"
      )}
    >
      {isEditing && (
        <div className="absolute top-4 right-4 z-10 flex gap-2 transition-opacity">
          {experiences.length >= 2 && (
            <MonoRearrangeButton
              onClick={() => openSidebar?.(sidebars.sortWorks)}
              title="Rearrange experience"
              tooltipText="Rearrange"
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenWorkSidebar(null)}
            className="h-8 w-8 rounded-full border-black/10 bg-white p-0 opacity-100 shadow-sm transition-colors hover:bg-gray-50 md:opacity-0 md:group-hover/section:opacity-100 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
          >
            <Plus className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
          <SectionVisibilityButton
            sectionId="works"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border-black/10 bg-white shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
          />
        </div>
      )}

      <h2 className="font-dm-mono text-scaled-14 mb-5 font-bold tracking-wider text-[#463B34] uppercase dark:text-[#D4C9BC]">
        Experience
      </h2>

      {experiences.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-4 py-16 text-center backdrop-blur-sm dark:border-white/10",
            !hasWallpaper && "bg-background",
            hasWallpaper && "bg-white dark:bg-[#1A1A1A]"
          )}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.03] dark:bg-white/[0.03]">
            <svg
              className="h-6 w-6 text-[#7A736C] dark:text-[#9E9893]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-scaled-15 mb-1 font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
            No experience yet
          </h3>
          <p className="text-scaled-13 mb-5 max-w-[250px] text-[#7A736C] dark:text-[#9E9893]">
            Add your work experience to showcase your career journey.
          </p>
          {isEditing && (
            <Button
              onClick={() => handleOpenWorkSidebar(null)}
              className="text-scaled-13 h-9 rounded-full bg-[#1A1A1A] px-4 font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
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
              className="group relative -mx-3 border-b border-[#D5D0C6] px-3 transition-colors last:border-0 hover:bg-[#DED9CE]/30 dark:border-[#3A352E] dark:hover:bg-white/[0.02]"
            >
              {isEditing && (
                <div className="absolute top-4 right-3 z-20 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 rounded-full border-black/10 bg-white p-0 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWorkSidebar(exp);
                    }}
                  >
                    <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                  </Button>
                </div>
              )}
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="flex w-full cursor-pointer flex-col gap-2 py-4 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ rotate: expandedIndex === index ? 45 : 0 }}
                    className="text-scaled-18 flex h-4 w-4 shrink-0 items-center justify-center leading-none font-light text-[#1A1A1A] dark:text-[#F0EDE7]"
                  >
                    +
                  </motion.span>
                  <span className="font-jetbrains text-scaled-14 font-medium tracking-wide text-[#1A1A1A] uppercase dark:text-[#F0EDE7]">
                    <span className="mr-2 text-[#7A736C] dark:text-[#9E9893]">
                      {exp.startYear} /
                    </span>
                    {exp.company}
                  </span>
                </div>
                <span className="font-jetbrains text-scaled-14 ml-7 tracking-wider text-[#7A736C] uppercase transition-colors group-hover:text-[#1A1A1A] sm:ml-0 dark:text-[#9E9893] dark:group-hover:text-[#F0EDE7]">
                  {exp.role}
                </span>
              </button>
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pr-4 pb-3 pl-7">
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
