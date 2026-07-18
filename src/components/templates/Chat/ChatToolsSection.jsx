import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { ChatAvatar, YouPrompt } from "./chatUtils";

export default function ChatToolsSection({
  chatRevealStep,
  s,
  sectionSteps,
  getNextLeftStep,
  canEdit,
}) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { skills = [], tools = [] } = userDetails || {};
  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);

  return (
    <div className="flex flex-col gap-3" style={{ order: sectionSteps.tools - 3 }}>
      {/* You: "What are the tools you work with?" */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(4) && (skills.length > 0 || tools.length > 0 || canEdit) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex justify-end"
          >
            <YouPrompt>What are the tools you work with?</YouPrompt>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tools bubble */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(6) && (tools.length > 0 || canEdit) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex max-w-[72%] gap-3"
          >
            {canEdit && chatRevealStep >= sectionSteps.tools + 3 && (
              <div className="absolute top-1/2 -left-0 z-40 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar(sidebars.tools);
                  }}
                >
                  <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
              <ChatAvatar avatarSrc={avatarSrc} show={chatRevealStep < getNextLeftStep("tools")} />
            </div>
            <div className="min-w-0 overflow-hidden rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-4 transition-colors duration-100 dark:border-white/5 dark:bg-[#2A2520]">
              {tools.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                  <p className="text-scaled-13 mb-3 text-[#7A736C] dark:text-[#9E9893]">
                    No tools added yet.
                  </p>
                  {canEdit && (
                    <Button
                      onClick={() => openSidebar(sidebars.tools)}
                      className="text-scaled-13 flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-4 font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Tools
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-scaled-15 mb-3 text-[#1A1A1A] dark:text-[#F0EDE7]">
                    This is my toolbox:
                  </p>
                  {tools.length > 6 ? (
                    <div className="relative overflow-hidden rounded-xl">
                      <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-gradient-to-r from-[#E5E2DB] to-transparent dark:from-[#2A2520]"></div>
                      <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-gradient-to-l from-[#E5E2DB] to-transparent dark:from-[#2A2520]"></div>
                      <motion.div
                        className="flex w-max gap-2 py-1"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                          ease: "linear",
                          duration: Math.max(15, tools.length * 2),
                          repeat: Infinity,
                        }}
                      >
                        {[...tools, ...tools].map((tool, i) => (
                          <div
                            key={i}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-[#E5E2DB] shadow-sm dark:border-white/5 dark:bg-[#35302A]"
                          >
                            <img
                              src={tool.image}
                              className="h-6 w-6 object-contain"
                              alt={tool.label || "tool"}
                            />
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tools.map((tool, i) => (
                        <div
                          key={tool._id || i}
                          className="group/tool relative flex h-10 w-10 items-center justify-center rounded-2xl border border-black/5 bg-[#E5E2DB] shadow-sm dark:border-white/5 dark:bg-[#35302A]"
                        >
                          <img
                            src={tool.image}
                            className="h-6 w-6 object-contain"
                            alt={tool.label || "tool"}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => openSidebar(sidebars.tools)}
                      className="mt-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-dashed border-black/20 bg-white/50 transition-colors hover:bg-black/5 dark:border-white/20 dark:bg-[#35302A]/50 dark:hover:bg-white/5"
                    >
                      <Plus className="h-5 w-5 text-[#7A736C] dark:text-[#9E9893]" />
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
