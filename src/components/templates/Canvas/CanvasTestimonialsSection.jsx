import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Plus, Trash2, Play, Square } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { CanvasSectionControls, CanvasSectionButton } from "./CanvasSectionControls";
import ClampableTiptapContent from "@/components/ClampableTiptapContent";
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
  const { userDetails, setSelectedReview, openSidebar } = useGlobalContext();
  const { reviews = [] } = userDetails || {};

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
      {isEditing && reviews.length > 0 && (
        <CanvasSectionControls>
          <CanvasSectionButton
            icon={<Plus className="w-3.5 h-3.5" />}
            label="Add Testimonial"
            onClick={() => openSidebar?.(sidebars.review)}
          />
        </CanvasSectionControls>
      )}
      <h2
        className="text-[#7A736C] dark:text-[#B5AFA5] text-xs font-mono mb-6"
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "14px",
          fontWeight: "500",
        }}
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
                  <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

                <ClampableTiptapContent
                  content={review?.description || ""}
                  mode="review"
                  enableBulletList={false}
                  maxLines={3}
                  itemId={review?._id ?? `review-${currentIndex}`}
                  expandedIds={expandedReviewIds}
                  onToggleExpand={toggleExpandReview}
                  className="font-inter text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed mb-6 italic"
                />

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
                      <h4 className="font-medium text-[14px]">{review.name}</h4>
                      <p className="text-[13px] text-[#7A736C] dark:text-[#B5AFA5]">
                        {review.company}
                      </p>
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
