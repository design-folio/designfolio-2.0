import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.015 } } }}
        initial="hidden"
        animate="show"
        className="text-[14px] leading-relaxed mt-1 break-words whitespace-normal"
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
                    variants={{ hidden: { opacity: 0, filter: "blur(10px)" }, show: { opacity: 1, filter: "blur(0px)" } }}
                    transition={{ duration: 0.3 }}
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
  const { userDetails, openSidebar, setSelectedWork } = useGlobalContext();
  const { experiences = [] } = userDetails || {};
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );

  return (
    <div
      className="flex flex-col gap-3"
      style={{ order: sectionSteps.works - 3 }}
    >
      {/* You: Experience Prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(10) &&
          !(preview && experiences.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-end relative group/msg"
            >
              <YouPrompt>Tell me about your work experience?</YouPrompt>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Experience Details */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(11) &&
          !(preview && experiences.length === 0) && (
            <>
              {experiences.length > 0 ? (
                <motion.div
                  key="experience-details"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 max-w-[85%] relative group/msg"
                >
                  {canEdit && chatRevealStep >= s(12) && (
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSidebar(sidebars.work);
                        }}
                      >
                        <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                      </Button>
                    </div>
                  )}
                  <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                    <ChatAvatar
                      avatarSrc={avatarSrc}
                      show={chatRevealStep < getNextLeftStep("works")}
                    />
                  </div>
                  <div className="bg-white dark:bg-[#2A2520] px-4 py-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-400 border border-black/5 dark:border-white/5 w-full">
                    {chatRevealStep === s(11) ? (
                      <TypingIndicator />
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] mb-3">
                          Here's a quick overview of my experience:
                        </p>
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full"
                        >
                          {experiences.map((exp, index) => (
                            <AccordionItem
                              key={index}
                              value={`item-${index}`}
                              className="relative group/exp border-b border-black/5 dark:border-white/5 last:border-0"
                            >
                              {canEdit && (
                                <div className="absolute -left-10 top-2 z-40 opacity-0 group-hover/exp:opacity-100 transition-opacity">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 w-6 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedWork(exp);
                                      openSidebar(sidebars.work);
                                    }}
                                  >
                                    <Pencil className="w-2.5 h-2.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                                  </Button>
                                </div>
                              )}
                              <AccordionTrigger className="hover:no-underline py-3 px-1">
                                <div className="flex flex-col w-full pr-4 text-left">
                                  <div className="flex justify-between items-baseline w-full">
                                    <h4 className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-[15px]">
                                      {exp.role}
                                    </h4>
                                    <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[13px]">
                                      {`${exp.startMonth || ""} ${exp.startYear || ""}`}
                                    </span>
                                  </div>
                                  <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[14px] mt-0.5">
                                    {exp.company}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pb-3 px-1">
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
                  className="flex gap-3 max-w-[85%]"
                >
                  <div className="w-8 h-8 shrink-0" />
                  <div className="flex flex-col items-center justify-center w-full py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520]/50 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-full bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-[#7A736C] dark:text-[#9E9893]"
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
                    <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
                      No experience yet
                    </h3>
                    <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
                      Add your work experience to showcase your career journey.
                    </p>
                    {canEdit && (
                      <Button
                        onClick={() => openSidebar(sidebars.work)}
                        className="h-9 px-5 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
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
