import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Plus, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { DEFAULT_PEGBOARD_IMAGES } from "@/lib/aboutConstants";
import {
  ABOUT_STORY_CHAR_THRESHOLD,
  renderDescriptionLines,
  truncatePlainText,
} from "@/lib/aboutStoryPreview";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";

export default function ChatAboutSection({
  chatRevealStep,
  s,
  sectionSteps,
  getNextLeftStep,
  canEdit,
  preview,
}) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { about } = userDetails || {};
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );

  const aboutImages =
    about?.pegboardImages?.length > 0
      ? about.pegboardImages
      : DEFAULT_PEGBOARD_IMAGES;
  const aboutDescription = about?.description;
  const hasAboutDescription =
    aboutDescription && getPlainTextLength(aboutDescription || "") > 0;
  const hasCustomAboutImages = about?.pegboardImages?.length > 0;
  const hasAboutContent = hasAboutDescription || hasCustomAboutImages;

  const [selectedStoryImage, setSelectedStoryImage] = useState(null);
  const storyPlain =
    typeof aboutDescription === "string" ? aboutDescription.trim() : "";
  const storyNeedsExpand = storyPlain.length > ABOUT_STORY_CHAR_THRESHOLD;
  const [aboutStoryExpanded, setAboutStoryExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setAboutStoryExpanded(false);
  }, [storyPlain]);

  return (
    <div
      className="flex flex-col gap-3"
      style={{ order: sectionSteps.about - 3 }}
    >
      {/* You: Story prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(16) && !(preview && !hasAboutContent) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end relative group/msg"
          >
            <YouPrompt>Tell me more about you</YouPrompt>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Images */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(17) && !(preview && !hasAboutContent) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && chatRevealStep >= s(18) && (
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.about);
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              <ChatAvatar
                avatarSrc={avatarSrc}
                show={chatRevealStep < s(18)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] ml-1 font-medium">
                {userDetails?.firstName || "Me"}
              </span>
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] p-3 sm:p-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-fit">
                {chatRevealStep === s(17) ? (
                  <div className="flex space-x-1.5 items-center px-1 min-h-[46px]">
                    <TypingIndicator />
                  </div>
                ) : aboutImages.length > 0 ? (
                  <div className="my-1 mx-1">
                    <div className="flex gap-2">
                      {aboutImages.slice(0, 2).map((img, idx) => {
                        const imgSrc = img?.src || img?.key || img;
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                            onClick={() => setSelectedStoryImage(imgSrc)}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 cursor-pointer"
                          >
                            <img
                              src={imgSrc}
                              alt={`Story ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : canEdit ? (
                  <button
                    onClick={() => openSidebar?.(sidebars.about)}
                    className="flex items-center gap-2 text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors px-2 py-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Story Images
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Text */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(18) && !(preview && !hasAboutContent) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] relative group/msg"
          >
            {canEdit && (
              <div className="absolute -left-2 top-1/2 -translate-y-[calc(50%+6px)] z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.about);
                  }}
                >
                  <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
              <ChatAvatar
                avatarSrc={avatarSrc}
                show={chatRevealStep < getNextLeftStep("about")}
              />
            </div>
            {hasAboutDescription ? (
              storyNeedsExpand ? (
                <div className="flex flex-col gap-0 rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-3 text-[15px] leading-relaxed text-[#1A1A1A] transition-colors duration-300 dark:border-white/5 dark:bg-[#2A2520] dark:text-[#F0EDE7]">
                  <div
                    className={`relative min-w-0 overflow-hidden ${!aboutStoryExpanded ? "max-h-[5em]" : ""}`}
                  >
                    <p className="break-words">
                      {renderDescriptionLines(
                        aboutStoryExpanded
                          ? storyPlain
                          : truncatePlainText(
                            storyPlain,
                            ABOUT_STORY_CHAR_THRESHOLD,
                          ),
                      )}
                    </p>
                    {!aboutStoryExpanded && (
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#E5E2DB] to-transparent dark:from-[#2A2520]"
                        aria-hidden
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-expanded={aboutStoryExpanded}
                    onClick={() => setAboutStoryExpanded((v) => !v)}
                    className="mt-2 h-auto justify-start gap-1.5 self-start px-2 py-1 text-[13px] font-medium text-[#1A1A1A] hover:bg-black/[0.06] dark:text-[#F0EDE7] dark:hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#E5E2DB] dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#2A2520]"
                  >
                    {aboutStoryExpanded ? "View less" : "View more"}
                    <motion.span
                      aria-hidden
                      className="inline-flex [&_svg]:pointer-events-none"
                      animate={{ rotate: aboutStoryExpanded ? 180 : 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
                      }
                    >
                      <ChevronDown data-icon="inline-end" />
                    </motion.span>
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-3 text-[15px] leading-relaxed text-[#1A1A1A] transition-colors duration-300 dark:border-white/5 dark:bg-[#2A2520] dark:text-[#F0EDE7]">
                  <p className="break-words">
                    {typeof aboutDescription === "string"
                      ? renderDescriptionLines(storyPlain)
                      : null}
                  </p>
                </div>
              )
            ) : canEdit ? (
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5">
                <button
                  onClick={() => openSidebar?.(sidebars.about)}
                  className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
                >
                  Click here to add your story...
                </button>
              </div>
            ) : (
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-100 border border-black/5 dark:border-white/5">
                <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[13px]">
                  Click here to add your story...
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedStoryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStoryImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedStoryImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedStoryImage}
                alt="Story full view"
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
