import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, ChevronDown, Pencil, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { tiptapToDisplayString, getPlainTextLength } from "@/lib/tiptapUtils";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";

const INITIAL_VISIBLE = 3;
const REVIEW_CHAR_THRESHOLD = 200;

export default function ChatTestimonialsSection({
  chatRevealStep,
  s,
  sectionSteps,
  getNextLeftStep,
  canEdit,
}) {
  const { userDetails, openSidebar, openNewReview, setSelectedReview } = useGlobalContext();
  const { reviews = [] } = userDetails || {};
  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);

  const [expandedIds, setExpandedIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = reviews.length > visibleCount;

  return (
    <div className="flex flex-col gap-3" style={{ order: sectionSteps.reviews - 3 }}>
      {/* You: Testimonials prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(13) && (reviews.length > 0 || canEdit) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group/msg relative flex justify-end"
          >
            <YouPrompt>What do clients say about your work?</YouPrompt>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Testimonials content */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(14) && (reviews.length > 0 || canEdit) && (
          <>
            {reviews.length > 0 ? (
              <>
                {/* Intro bubble */}
                <motion.div
                  key="testimonials-intro"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group/msg relative flex max-w-[85%] gap-3"
                >
                  <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
                    <ChatAvatar avatarSrc={avatarSrc} show={chatRevealStep < s(15)} />
                  </div>
                  <div className="text-scaled-15 flex min-h-[46px] items-center rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-4 py-3 leading-relaxed text-[#1A1A1A] transition-colors duration-100 dark:border-white/5 dark:bg-[#2A2520] dark:text-[#F0EDE7]">
                    {chatRevealStep === s(14) ? (
                      <TypingIndicator />
                    ) : (
                      "Here's what a few clients have said after working with me"
                    )}
                  </div>
                </motion.div>

                {/* Review cards */}
                {chatRevealStep >= s(15) &&
                  visibleReviews.map((review, index) => {
                    const reviewId = review._id || `review-${index}`;
                    const plainText = tiptapToDisplayString(review.description);
                    const needsExpand =
                      getPlainTextLength(review.description) > REVIEW_CHAR_THRESHOLD;
                    const isExpanded = expandedIds.has(reviewId);

                    return (
                      <motion.div
                        key={reviewId}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, delay: index * 0.06 }}
                        className="group/msg relative flex max-w-[85%] gap-3"
                      >
                        {canEdit && (
                          <div className="absolute top-1/2 -left-0 z-40 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity duration-150 group-hover/msg:opacity-100">
                            {reviews.length >= 2 && index === 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm transition-transform duration-100 hover:bg-gray-50 active:scale-[0.97] dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSidebar(sidebars.sortReviews);
                                }}
                              >
                                <ChevronsUpDown className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm transition-transform duration-100 hover:bg-gray-50 active:scale-[0.97] dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReview(review);
                                openSidebar(sidebars.review);
                              }}
                            >
                              <Pencil className="h-3 w-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                            </Button>
                          </div>
                        )}

                        <div className="mt-auto flex h-8 w-8 shrink-0 items-end">
                          <ChatAvatar
                            avatarSrc={avatarSrc}
                            show={
                              index === visibleReviews.length - 1 &&
                              !hasMore &&
                              chatRevealStep < getNextLeftStep("reviews")
                            }
                          />
                        </div>

                        <div className="w-full rounded-2xl rounded-tl-sm rounded-bl-sm border border-black/5 bg-[#E5E2DB] p-4 transition-colors duration-700 dark:border-white/5 dark:bg-[#2A2520]">
                          {/* Reviewer header */}
                          <div className="mb-3 flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5 dark:ring-white/5">
                              <img
                                src={review?.avatar?.url || review?.avatar || ""}
                                alt={review?.name || "Reviewer"}
                                className="h-full w-full bg-[#D5CFC7] object-cover dark:bg-[#3A352E]"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://i.pravatar.cc/150?u=a042581f4e29026704d";
                                }}
                              />
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <span className="text-scaled-14 truncate font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                                {review?.name || "Anonymous"}
                              </span>
                              {review?.designation && (
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="h-3 w-3 shrink-0 text-[#0077b5]"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                  </svg>
                                  <span className="text-scaled-12 truncate text-[#7A736C] dark:text-[#B5AFA5]">
                                    {review.designation}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quote text */}
                          {needsExpand ? (
                            <div>
                              {/* Clipped region + gradient as a single positioned unit */}
                              <div className="relative">
                                <p
                                  className={`text-scaled-13 leading-relaxed break-words text-[#1A1A1A] italic dark:text-[#F0EDE7] overflow-hidden${isExpanded ? "" : " line-clamp-4"}`}
                                >
                                  {plainText ? `"${plainText}"` : ""}
                                </p>
                                {!isExpanded && (
                                  <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-[#E5E2DB] to-transparent dark:from-[#2A2520]"
                                    aria-hidden
                                  />
                                )}
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(reviewId);
                                }}
                                className="text-scaled-12 mt-2 flex items-center gap-0.5 font-medium text-[#7A736C] transition-[color,transform] duration-150 hover:text-[#1A1A1A] active:scale-[0.97] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]"
                              >
                                {isExpanded ? "View less" : "View more"}
                                <motion.span
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{
                                    duration: 0.25,
                                    ease: [0.23, 1, 0.32, 1],
                                  }}
                                  className="inline-flex"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </motion.span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-scaled-13 leading-relaxed text-[#1A1A1A] italic dark:text-[#F0EDE7]">
                              {plainText ? `"${plainText}"` : ""}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                {/* Load more — centered divider, aligned to card left edge */}
                {chatRevealStep >= s(15) && hasMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 pl-11"
                  >
                    <div className="h-px flex-1 bg-black/[0.07] dark:bg-white/[0.07]" />
                    <button
                      onClick={() => setVisibleCount((v) => v + INITIAL_VISIBLE)}
                      className="text-scaled-11 flex items-center gap-1 font-medium whitespace-nowrap text-[#7A736C] transition-[color,transform] duration-150 hover:text-[#1A1A1A] active:scale-[0.97] dark:text-[#B5AFA5] dark:hover:text-[#F0EDE7]"
                    >
                      {reviews.length - visibleCount} more
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <div className="h-px flex-1 bg-black/[0.07] dark:bg-white/[0.07]" />
                  </motion.div>
                )}
              </>
            ) : (
              /* Empty state */
              <motion.div
                key="testimonials-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex max-w-[85%] gap-3"
              >
                <div className="h-8 w-8 shrink-0" />
                <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-[#E5E2DB] px-4 py-16 text-center dark:border-white/10 dark:bg-[#2A2520]/50">
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
                  <h3 className="text-scaled-15 mb-1 font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                    No recommendations yet
                  </h3>
                  <p className="text-scaled-13 mb-5 max-w-[250px] text-[#7A736C] dark:text-[#9E9893]">
                    Add recommendations to build trust and credibility.
                  </p>
                  {canEdit && (
                    <Button
                      onClick={() => openNewReview()}
                      className="text-scaled-13 flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-4 font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Testimonial
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
