import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Pencil, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { sidebars } from "@/lib/constant";
import { tiptapToDisplayString } from "@/lib/tiptapUtils";
import { TypingIndicator, ChatAvatar, YouPrompt } from "./chatUtils";

export default function ChatTestimonialsSection({
  chatRevealStep,
  s,
  sectionSteps,
  getNextLeftStep,
  canEdit,
  preview,
}) {
  const {
    userDetails,
    openSidebar,
    setSelectedReview,
  } = useGlobalContext();
  const { reviews = [] } = userDetails || {};
  const avatarSrc = useMemo(
    () => getUserAvatarImage(userDetails),
    [userDetails],
  );

  return (
    <div
      className="flex flex-col gap-3"
      style={{ order: sectionSteps.reviews - 3 }}
    >
      {/* You: Testimonials prompt */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(13) && !(preview && reviews.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end relative group/msg"
          >
            <YouPrompt>What do clients say about your work?</YouPrompt>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Testimonials content */}
      <AnimatePresence mode="popLayout">
        {chatRevealStep >= s(14) && !(preview && reviews.length === 0) && (
          <>
            {reviews.length > 0 ? (
              <>
                {/* Testimonials Intro */}
                <motion.div
                  key="testimonials-intro"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 max-w-[85%] relative group/msg"
                >
                  <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                    <ChatAvatar
                      avatarSrc={avatarSrc}
                      show={chatRevealStep < s(15)}
                    />
                  </div>
                  <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-4 py-3 rounded-2xl rounded-tl-sm rounded-bl-sm text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] leading-relaxed transition-colors duration-300 border border-black/5 dark:border-white/5 min-h-[46px] flex items-center">
                    {chatRevealStep === s(14) ? (
                      <TypingIndicator />
                    ) : (
                      "Here's what a few clients have said after working with me"
                    )}
                  </div>
                </motion.div>

                {/* All Review Cards */}
                {chatRevealStep >= s(15) &&
                  reviews.map((review, index) => (
                    <motion.div
                      key={review._id || index}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.15 }}
                      className="flex gap-3 max-w-[85%] relative group/msg"
                    >
                      {canEdit && (
                        <div className="absolute -left-0 top-1/2 -translate-y-1/2 z-40 transition-opacity flex gap-1.5 opacity-0 group-hover/msg:opacity-100">
                          {reviews.length >= 2 && index === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSidebar(sidebars.sortReviews);
                              }}
                            >
                              <ChevronsUpDown className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReview(review);
                              openSidebar(sidebars.review);
                            }}
                          >
                            <Pencil className="w-3 h-3 text-[#1A1A1A] dark:text-[#F0EDE7]" />
                          </Button>
                        </div>
                      )}
                      <div className="w-8 h-8 shrink-0 mt-auto flex items-end">
                        <ChatAvatar
                          avatarSrc={avatarSrc}
                          show={
                            index === reviews.length - 1 &&
                            chatRevealStep < getNextLeftStep("reviews")
                          }
                        />
                      </div>
                      <div className="bg-[#E5E2DB] dark:bg-[#2A2520] p-4 rounded-2xl rounded-tl-sm rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                            <img
                              src={
                                review?.avatar?.url || review?.avatar || ""
                              }
                              alt={review?.name || "Reviewer"}
                              className="w-full h-full object-cover bg-gray-200 dark:bg-gray-800"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://i.pravatar.cc/150?u=a042581f4e29026704d";
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#1A1A1A] dark:text-[#F0EDE7] font-medium text-[15px]">
                              {review?.name || "Anonymous"}
                            </span>
                            {review?.designation && (
                              <div className="flex items-center gap-1.5">
                                <svg
                                  className="w-3.5 h-3.5 text-[#0077b5]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                <span className="text-[#7A736C] dark:text-[#B5AFA5] text-[13px]">
                                  {review.designation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[14px] leading-relaxed italic">
                          {review?.description
                            ? `"${tiptapToDisplayString(review.description)}"`
                            : ""}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </>
            ) : (
              /* Empty state */
              <motion.div
                key="testimonials-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[85%]"
              >
                <div className="w-8 h-8 shrink-0" />
                <div className="flex flex-col items-center justify-center w-full py-16 px-4 text-center rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-[#E5E2DB] dark:bg-[#2A2520]/50 backdrop-blur-sm">
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
                  {canEdit && (
                    <Button
                      onClick={() => openSidebar(sidebars.review)}
                      className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#1A1A1A] dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
