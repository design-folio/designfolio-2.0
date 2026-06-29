import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronsUpDown, Pencil, Plus, Trash2, Play, Square } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import { SectionVisibilityButton } from "@/components/section";
import { getPlainTextLength, parseTiptapToWords } from "@/lib/tiptapUtils";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const THRESHOLD = 200;

function renderTiptapWords(content, charLimit = null) {
  const words = parseTiptapToWords(content);
  let charCount = 0;
  const elements = [];

  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi];
    if (word[0]?.isBreak) {
      elements.push(<br key={`br-${wi}`} />);
      continue;
    }
    const text = word.map((c) => c.ch).join("");
    if (charLimit !== null && charCount + text.length > charLimit) {
      const remaining = charLimit - charCount;
      if (remaining > 0)
        elements.push(<React.Fragment key={wi}>{text.slice(0, remaining)}</React.Fragment>);
      break;
    }
    charCount += text.length;
    const { bold, italic, underline, strike, highlight } = word[0] || {};
    const cn =
      [
        bold && "font-bold",
        italic && "italic",
        underline && "underline",
        strike && "line-through",
        highlight && "bg-[#f9daa3] rounded-sm px-0.5",
      ]
        .filter(Boolean)
        .join(" ") || undefined;
    elements.push(
      <React.Fragment key={wi}>{cn ? <span className={cn}>{text}</span> : text} </React.Fragment>
    );
  }
  return elements;
}

function getTextFromTiptap(node) {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  if (node.type === "hardBreak") return "\n";
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(getTextFromTiptap).join("");
  }
  return "";
}

function CanvasTestimonialsSection({ isEditing, preview = false }) {
  const { userDetails, setSelectedReview, openSidebar, openNewReview } = useGlobalContext();
  const { reviews = [] } = userDetails || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  const toggleExpandReview = useCallback((id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
    [playingId]
  );

  if (preview && !isEditing && (reviews?.length ?? 0) === 0) {
    return null;
  }

  const review = reviews[currentIndex];
  const reviewTextLength = getPlainTextLength(review?.description || "");
  const needsExpand = reviewTextLength > THRESHOLD;
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
      className="group/section relative w-full rounded-[26px] border border-[#E5D7C4] bg-white p-6 dark:border-white/10 dark:bg-[#2A2520]"
    >
      {isEditing && (
        <CanvasSectionControls>
          {reviews.length >= 2 && (
            <CanvasSectionButton
              icon={<ChevronsUpDown className="h-3.5 w-3.5" />}
              tooltipText="Rearrange"
              onClick={() => openSidebar?.(sidebars.sortReviews)}
            />
          )}
          {reviews.length > 0 && (
            <CanvasSectionButton
              icon={<Plus className="h-3.5 w-3.5" />}
              label="Add Testimonial"
              onClick={() => openNewReview()}
            />
          )}
          <SectionVisibilityButton
            sectionId="reviews"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border border-[#E5D7C4] bg-white shadow-md hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:hover:bg-[#35302A]"
          />
        </CanvasSectionControls>
      )}

      {/* Header row: title left, indicators right */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-dm-mono text-[14px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
          TESTIMONIALS
        </h2>
        {reviews.length > 1 && (
          <div className="flex items-center gap-1.5">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setIsHovering(true);
                  setTimeout(() => setIsHovering(false), 5000);
                }}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-[#1A1A1A] dark:bg-[#F0EDE7]"
                    : "w-1.5 bg-[#E5D7C4] hover:bg-[#D5D0C6] dark:bg-white/20 dark:hover:bg-white/40"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-background flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-4 py-16 text-center backdrop-blur-sm dark:border-white/10">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              No recommendations yet
            </h3>
            <p className="mb-5 max-w-[250px] text-[13px] text-[#7A736C] dark:text-[#9E9893]">
              Add recommendations to build trust and credibility.
            </p>
            {isEditing && (
              <Button
                onClick={() => openNewReview()}
                className="h-9 rounded-full bg-[#1A1A1A] px-4 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
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
                className="group relative"
              >
                {isEditing && (
                  <div className="absolute top-0 right-0 z-20 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReview(review);
                        openSidebar(sidebars.review);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReview(review);
                        openSidebar(sidebars.review);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                    </Button>
                  </div>
                )}

                <div className="relative z-10 mb-6">
                  {needsExpand ? (
                    <>
                      <div className={`relative overflow-hidden ${!isExpanded ? "h-[5em]" : ""}`}>
                        <p className="text-[15px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]">
                          {isExpanded
                            ? renderTiptapWords(review?.description)
                            : renderTiptapWords(review?.description, THRESHOLD)}
                        </p>
                        {!isExpanded && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-[#2A2520]" />
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandReview(reviewId);
                        }}
                        className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A] opacity-70 transition-opacity hover:opacity-100 dark:text-[#F0EDE7]"
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
                      className="text-[15px] leading-relaxed text-[#7A736C] dark:text-[#B5AFA5]"
                      noCardStyle
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 shrink-0 rounded-xl">
                      <AvatarImage src={review?.avatar?.url || review?.avatar} alt={review?.name} />
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
                      <h4 className="text-[14px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                        {review.name}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {review?.linkedinLink && review?.linkedinLink?.trim() !== "" && (
                          <a
                            href={review.linkedinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0077b5] opacity-60 transition-opacity hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Open ${review.name}'s LinkedIn`}
                          >
                            <svg
                              className="h-[13px] w-[13px]"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </a>
                        )}
                        <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
                          {review.company}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlay(review.description, review._id)}
                    className="flex items-center gap-2 rounded-full border border-[#E5D7C4] bg-white px-3 py-1.5 text-[#1A1A1A] shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520] dark:text-[#F0EDE7] dark:hover:bg-[#35302A]"
                  >
                    {playingId === review._id ? (
                      <>
                        <Square size={14} className="fill-current" />
                        <div className="flex h-[14px] w-[30px] items-center justify-center gap-[2px]">
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-[2px] rounded-full bg-current"
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
                        <span className="w-[30px] text-center text-[12px] font-medium">Play</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasTestimonialsSection);
