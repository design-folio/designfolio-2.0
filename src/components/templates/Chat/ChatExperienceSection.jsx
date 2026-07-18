import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronsUpDown, Pencil, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { parseTiptapToWords } from "@/lib/tiptapUtils";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";

function ExperienceDescription({ desc }) {
  const words = parseTiptapToWords(desc);
  if (!words.length) return null;

  return (
    <div className="flex flex-col overflow-hidden">
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.015 } },
        }}
        initial="hidden"
        animate="show"
        className="text-scaled-14 mt-1 leading-relaxed break-words whitespace-normal"
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
                      hidden: { opacity: 0, filter: "blur(10px)" },
                      show: { opacity: 1, filter: "blur(0px)" },
                    }}
                    transition={{ duration: 0.3 }}
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
      </motion.div>
    </div>
  );
}

export default function ChatExperienceSection({
  chatRevealStep,
  s,
  sectionSteps,
  getNextLeftStep,
  canEdit,
  preview,
}) {
  const { userDetails, openSidebar, openNewWork, setSelectedWork } = useGlobalContext();
  const { experiences = [] } = userDetails || {};
  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);

  return (
    <div className="flex flex-col gap-3" style={{ order: sectionSteps.works - 3 }}>
      {/* You: Experience Prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(10) && (experiences.length > 0 || canEdit) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex justify-end"
          >
            <YouPrompt>Tell me about your work experience?</YouPrompt>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experience Details */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(11) && (experiences.length > 0 || canEdit) && (
          <>
            {experiences.length > 0 ? (
              <motion.div
                key="experience-details"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group/msg relative flex max-w-[85%] gap-3"
              >
                <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
                  <ChatAvatar
                    avatarSrc={avatarSrc}
                    show={chatRevealStep < getNextLeftStep("works")}
                  />
                </div>
                <div className="w-full rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-4 transition-colors duration-100 dark:border-white/5 dark:bg-[#2A2520]">
                  {chatRevealStep === s(11) ? (
                    <TypingIndicator />
                  ) : (
                    <div className="space-y-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-scaled-15 text-[#1A1A1A] dark:text-[#F0EDE7]">
                          Here&apos;s a quick overview of my experience:
                        </p>
                        {canEdit && experiences.length >= 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 shrink-0 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSidebar(sidebars.sortWorks);
                            }}
                          >
                            <ChevronsUpDown className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                          </Button>
                        )}
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {experiences.map((exp, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="group/exp relative border-b border-black/5 last:border-0 dark:border-white/5"
                          >
                            {canEdit && (
                              <div className="absolute top-2 right-1 z-40 opacity-0 transition-opacity group-hover/exp:opacity-100">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWork(exp);
                                    openSidebar(sidebars.work);
                                  }}
                                >
                                  <Pencil className="h-2.5 w-2.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                                </Button>
                              </div>
                            )}
                            <AccordionTrigger className="px-1 py-3 hover:no-underline">
                              <div className="flex w-full flex-col pr-4 text-left">
                                <div className="flex w-full items-baseline justify-between">
                                  <h4 className="text-scaled-15 font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                                    {exp.role}
                                  </h4>
                                  <span className="text-scaled-13 text-[#7A736C] dark:text-[#B5AFA5]">
                                    {`${exp.startMonth || ""} ${exp.startYear || ""}`}
                                  </span>
                                </div>
                                <span className="text-scaled-14 mt-0.5 text-[#7A736C] dark:text-[#B5AFA5]">
                                  {exp.company}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-1 pb-3">
                              <ExperienceDescription desc={exp.description} />
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="experience-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex max-w-[85%] gap-3"
              >
                <div className="h-8 w-8 shrink-0" />
                <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white px-4 py-16 text-center backdrop-blur-sm dark:border-white/10 dark:bg-[#2A2520]/50">
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
                  {canEdit && (
                    <Button
                      onClick={() => openNewWork()}
                      className="text-scaled-13 flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Experience
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
