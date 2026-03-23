import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Pencil, Plus, Trash2, Play, Square } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { _updateUser } from "@/network/post-request";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getTextFromTiptap(node) {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  if (node.type === "hardBreak") return "\n";
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(getTextFromTiptap).join("");
  }
  return "";
}

function CanvasTestimonialsSection({ isEditing }) {
  const { userDetails, setSelectedReview, openSidebar, setUserDetails, updateCache } = useGlobalContext();
  const { reviews = [], hiddenSections = [] } = userDetails || {};

  const sectionId = "reviews";
  const isSectionHidden = hiddenSections.includes(sectionId);
  const handleToggleVisibility = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = isSectionHidden
      ? hiddenSections.filter((id) => id !== sectionId)
      : [...hiddenSections, sectionId];
    setUserDetails((prev) => ({ ...prev, hiddenSections: updated }));
    updateCache("userDetails", (prev) => ({ ...prev, hiddenSections: updated }));
    _updateUser({ hiddenSections: updated });
  }, [isSectionHidden, hiddenSections, setUserDetails, updateCache]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  const toggleExpandReview = useCallback((id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // Auto carousel
  useEffect(() => {
    if (isHovering || reviews.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length, isHovering]);

  // Speech synthesis cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = useCallback(
    (text, id) => {
      if (playingId === id) {
        window.speechSynthesis.cancel();
        setPlayingId(null);
      } else {
        window.speechSynthesis.cancel();
        const textContent = getTextFromTiptap(text);
        const utterance = new SpeechSynthesisUtterance(textContent);
        utterance.onend = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
        setPlayingId(id);
      }
    },
    [playingId],
  );

  const review = reviews[currentIndex];
  const reviewTextLength = getPlainTextLength(review?.description || "");
  const needsExpand = reviewTextLength > 150;
  const reviewId = review?._id ?? `review-${currentIndex}`;
  const isExpanded = expandedReviewIds.includes(reviewId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: 0.95,
      }}
      className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[24px] border border-[#E5D7C4] dark:border-white/10 p-6 w-full relative group/section"
    >
      {isEditing && (
        <CanvasSectionControls>
          {reviews.length > 0 && (
            <CanvasSectionButton
              icon={<Plus className="w-3.5 h-3.5" />}
              label="Add Testimonial"
              onClick={() => openSidebar?.(sidebars.review)}
            />
          )}
          <CanvasSectionButton
            icon={isSectionHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            ariaLabel={isSectionHidden ? "Show section" : "Hide section"}
            onClick={handleToggleVisibility}
            alwaysVisible={isSectionHidden}
          />
        </CanvasSectionControls>
      )}
      <h2
        className="text-[#7A736C] dark:text-[#B5AFA5] font-dm-mono font-medium text-[14px] mb-6"
      >
        TESTIMONIALS
      </h2>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 backdrop-blur-sm">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mb-1">
              No recommendations yet
            </h3>
            <p className="text-[13px] text-[#7A736C] dark:text-[#9E9893] max-w-[250px] mb-5">
              Add recommendations to build trust and credibility.
            </p>
            {isEditing && (
              <Button
                onClick={() => openSidebar?.(sidebars.review)}
                className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm"
              >
                Add Testimonial
              </Button>
            )}
          </div>
        ) : (
          <div className="relative w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="group border border-[#E5D7C4] dark:border-white/10 p-6 rounded-2xl bg-white/50 dark:bg-[#2A2520]/50 hover:bg-white dark:hover:bg-[#35302A] transition-colors relative"
              >
                {isEditing && (
                  <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReview(review);
                        openSidebar(sidebars.review);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReview(review);
                        openSidebar(sidebars.review);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                    </Button>
                  </div>
                )}

                <div className="mb-6 relative z-10">
                  <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[18px] leading-none align-top">
                    "
                  </span>
                  {needsExpand ? (
                    <>
                      <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : "4.875em" }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="block overflow-hidden"
                      >
                        <SimpleTiptapRenderer
                          content={review?.description || ""}
                          mode="review"
                          enableBulletList={false}
                          className="text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed"
                          noCardStyle
                        />
                      </motion.div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandReview(reviewId);
                        }}
                        className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] mt-3 flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
                      >
                        {isExpanded ? "View less" : "View more"}
                        <motion.svg
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </motion.svg>
                      </button>
                    </>
                  ) : (
                    <SimpleTiptapRenderer
                      content={review?.description || ""}
                      mode="review"
                      enableBulletList={false}
                      className="inline text-[#7A736C] dark:text-[#B5AFA5] text-[15px] leading-relaxed"
                      noCardStyle
                    />
                  )}
                  <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[18px] leading-none align-top">
                    "
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 shrink-0 rounded-xl">
                      <AvatarImage
                        src={review?.avatar?.url || review?.avatar}
                        alt={review?.name}
                      />
                      <AvatarFallback
                        className="rounded-none"
                        style={{
                          backgroundColor: "#FF9966",
                          color: "#FFFFFF",
                        }}
                      >
                        {review?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE7] text-[14px]">
                        {review.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {review?.linkedinLink && review?.linkedinLink?.trim() !== "" && (
                          <a
                            href={review.linkedinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0077b5] opacity-60 hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Open ${review.name}'s LinkedIn`}
                          >
                            <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </a>
                        )}
                        <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[13px]">
                          {review.company}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlay(review.description, review._id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#2A2520] border border-[#E5D7C4] dark:border-white/10 rounded-full text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-gray-50 dark:hover:bg-[#35302A] transition-colors shadow-sm"
                  >
                    {playingId === review._id ? (
                      <>
                        <Square size={14} className="fill-current" />
                        <div className="flex items-center justify-center gap-[2px] h-[14px] w-[30px]">
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-[2px] bg-current rounded-full"
                              animate={{ height: ["4px", "12px", "4px"] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeInOut",
                              }}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="fill-current" />
                        <span className="text-[12px] font-medium w-[30px] text-center">
                          Play
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Progress Indicators */}
        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 pt-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setIsHovering(true);
                  setTimeout(() => setIsHovering(false), 5000);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex
                    ? "w-6 bg-[#1A1A1A] dark:bg-[#F0EDE7]"
                    : "w-1.5 bg-[#E5D7C4] dark:bg-white/20 hover:bg-[#D5D0C6] dark:hover:bg-white/40"
                  }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasTestimonialsSection);
