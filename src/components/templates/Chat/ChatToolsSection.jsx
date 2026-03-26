import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";

export default function ChatToolsSection({
  chatRevealStep,
  s,
  sectionSteps,
  getNextLeftStep,
  canEdit,
  preview,
}) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { skills = [], tools = [] } = userDetails || {};
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );

  return (
    <div
      className="flex flex-col gap-3"
      style={{ order: sectionSteps.tools - 3 }}
    >
      {/* You: "Can I see your work?" */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(4) &&
          !(preview && skills.length === 0 && tools.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-end relative group/msg"
            >
              <YouPrompt>Can I see your work?</YouPrompt>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Skills message */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(5) && !(preview && skills.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && chatRevealStep >= s(6) && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => e.stopPropagation()}
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
                show={chatRevealStep < s(6)}
              />
            </div>
            <div className="bg-white dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-400 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
              {chatRevealStep === s(5) ? (
                <TypingIndicator />
              ) : skills.length > 0 ? (
                `My skills are ${skills.map((sk) => sk.label).join(", ")}`
              ) : (
                "I have a range of skills to offer"
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tools bubble */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(6) && !(preview && tools.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[72%] relative group/msg"
          >
            {canEdit && chatRevealStep >= sectionSteps.tools + 3 && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar(sidebars.tools);
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              <ChatAvatar
                avatarSrc={avatarSrc}
                show={chatRevealStep < getNextLeftStep("tools")}
              />
            </div>
            <div className="bg-white dark:bg-[#2A2520] px-4 py-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-400 border border-black/5 dark:border-white/5 overflow-hidden min-w-0">
              {tools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] mb-3">
                    No tools added yet.
                  </p>
                  {canEdit && (
                    <Button
                      onClick={() => openSidebar(sidebars.tools)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Tools
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] mb-3">
                    This is my toolbox:
                  </p>
                  {tools.length > 6 ? (
                    <div className="relative overflow-hidden rounded-xl">
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#2A2520] to-transparent z-10 pointer-events-none"></div>
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#2A2520] to-transparent z-10 pointer-events-none"></div>
                      <motion.div
                        className="flex gap-2 w-max py-1"
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
                            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#35302A] shadow-sm flex items-center justify-center border border-black/5 dark:border-white/5 flex-shrink-0"
                          >
                            <img
                              src={tool.image}
                              className="w-6 h-6 object-contain"
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
                          className="w-10 h-10 rounded-2xl bg-white dark:bg-[#35302A] shadow-sm flex items-center justify-center border border-black/5 dark:border-white/5 relative group/tool"
                        >
                          <img
                            src={tool.image}
                            className="w-6 h-6 object-contain"
                            alt={tool.label || "tool"}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => openSidebar(sidebars.tools)}
                      className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-[#35302A]/50 border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors mt-2"
                    >
                      <Plus className="w-5 h-5 text-[#7A736C] dark:text-[#9E9893]" />
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
