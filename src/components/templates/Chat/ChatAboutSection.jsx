import { useState, useMemo, useEffect, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Plus, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
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
  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);

  const aboutImages =
    about?.pegboardImages?.length > 0 ? about.pegboardImages : DEFAULT_PEGBOARD_IMAGES;
  const aboutDescription = about?.description;
  const hasAboutDescription = aboutDescription && getPlainTextLength(aboutDescription || "") > 0;
  const hasCustomAboutImages = about?.pegboardImages?.length > 0;
  const hasAboutContent = hasAboutDescription || hasCustomAboutImages;

  const [selectedStoryImage, setSelectedStoryImage] = useState(null);
  const storyPlain = typeof aboutDescription === "string" ? aboutDescription.trim() : "";
  const storyNeedsExpand = storyPlain.length > ABOUT_STORY_CHAR_THRESHOLD;
  const [aboutStoryExpanded, setAboutStoryExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    startTransition(() => setAboutStoryExpanded(false));
  }, [storyPlain]);

  return (
    <div className="flex flex-col gap-3" style={{ order: sectionSteps.about - 3 }}>
      {/* You: Story prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(16) && !(preview && !hasAboutContent) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex justify-end"
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
            className="group/msg relative flex max-w-[85%] gap-3"
          >
            {canEdit && chatRevealStep >= s(18) && (
              <div className="absolute top-1/2 -left-2 z-40 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.about);
                  }}
                >
                  <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
              <ChatAvatar avatarSrc={avatarSrc} show={chatRevealStep < s(18)} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="ml-1 text-[11px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                {userDetails?.firstName || "Me"}
              </span>
              <div className="w-fit rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] p-3 transition-colors duration-700 sm:p-4 dark:border-white/5 dark:bg-[#2A2520]">
                {chatRevealStep === s(17) ? (
                  <div className="flex min-h-[46px] items-center space-x-1.5 px-1">
                    <TypingIndicator />
                  </div>
                ) : aboutImages.length > 0 ? (
                  <div className="mx-1 my-1">
                    <div className="flex gap-2">
                      {aboutImages.slice(0, 2).map((img, idx) => {
                        const imgSrc = img?.src || img?.key || img;
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05, zIndex: 10 }}
                            onClick={() => setSelectedStoryImage(imgSrc)}
                            className="h-20 w-20 cursor-pointer overflow-hidden rounded-xl border border-black/5 shadow-sm sm:h-24 sm:w-24 dark:border-white/5"
                          >
                            <img
                              src={imgSrc}
                              alt={`Story ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : canEdit ? (
                  <button
                    onClick={() => openSidebar?.(sidebars.about)}
                    className="flex items-center gap-2 px-2 py-1 text-[13px] text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
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
        {chatRevealStep >= s(18) && !(preview && !hasAboutDescription) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex max-w-[85%] gap-3"
          >
            {canEdit && (
              <div className="absolute top-1/2 -left-2 z-40 flex -translate-y-[calc(50%+6px)] gap-1.5 opacity-0 transition-opacity group-hover/msg:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSidebar?.(sidebars.about);
                  }}
                >
                  <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                </Button>
              </div>
            )}
            <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
              <ChatAvatar avatarSrc={avatarSrc} show={chatRevealStep < getNextLeftStep("about")} />
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
                          : truncatePlainText(storyPlain, ABOUT_STORY_CHAR_THRESHOLD)
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
                    className="mt-2 h-auto justify-start gap-1.5 self-start px-2 py-1 text-[13px] font-medium text-[#1A1A1A] hover:bg-black/[0.06] focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#E5E2DB] dark:text-[#F0EDE7] dark:hover:bg-white/[0.08] dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#2A2520]"
                  >
                    {aboutStoryExpanded ? "View less" : "View more"}
                    <motion.span
                      aria-hidden
                      className="inline-flex [&_svg]:pointer-events-none"
                      animate={{ rotate: aboutStoryExpanded ? 180 : 0 }}
                      transition={
                        reduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
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
              <div className="rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-3 transition-colors duration-700 dark:border-white/5 dark:bg-[#2A2520]">
                <button
                  onClick={() => openSidebar?.(sidebars.about)}
                  className="text-[13px] text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#B5AFA5] dark:hover:text-white"
                >
                  Click here to add your story...
                </button>
              </div>
            ) : null}
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
            className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedStoryImage(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selectedStoryImage}
                alt="Story full view"
                className="h-auto max-h-[90vh] w-auto max-w-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
