import React, { memo, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Pencil, Play, Plus, Square } from "lucide-react";
import { parseTiptapToWords, getPlainTextLength } from "@/lib/tiptapUtils";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { SectionVisibilityButton } from "@/components/section";
import { ProfessionalRearrangeButton } from "./ProfessionalRearrangeButton";

const VIEW_MORE_THRESHOLD = 300;

function renderTiptapWords(content, charLimit = null) {
  const words = parseTiptapToWords(content);
  let charCount = 0;
  const elements = [];
  let truncated = false;

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
      truncated = true;
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
        highlight && "bg-[#f9daa3] rounded-sm px-0.5 text-black",
      ]
        .filter(Boolean)
        .join(" ") || undefined;
    elements.push(
      <React.Fragment key={wi}>{cn ? <span className={cn}>{text}</span> : text} </React.Fragment>
    );
  }
  if (truncated) elements.push("…");
  return elements;
}

function TestimonialCard({ review, isEditing, isPlaying, onPlay, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = getPlainTextLength(review?.description) > VIEW_MORE_THRESHOLD;
  // Full plain text used only for speech synthesis
  const plainText = parseTiptapToWords(review?.description)
    .map((w) => w.map((c) => c.ch).join(""))
    .join(" ");

  return (
    <div className="group relative rounded-xl border border-[#D5D0C6] p-6 transition-colors hover:bg-[#DED9CE]/30 dark:border-[#3A352E] dark:hover:bg-white/[0.02]">
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full border-[#E5D7C4] bg-white/90 p-0 shadow-sm backdrop-blur-sm hover:bg-gray-50 dark:border-white/10 dark:bg-[#2A2520]/90 dark:hover:bg-[#35302A]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(review);
            }}
          >
            <Pencil className="h-3.5 w-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <div className="mb-6">
        <p className="font-jetbrains relative z-10 text-[15px] leading-relaxed text-[#1A1A1A] dark:text-[#F0EDE7]">
          {renderTiptapWords(
            review?.description,
            !isExpanded && shouldTruncate ? VIEW_MORE_THRESHOLD : null
          )}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-jetbrains mt-2 text-[13px] text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
          >
            {isExpanded ? "View less" : "View more"}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-[#D5D0C6] dark:bg-[#3A352E]">
            {review?.avatar?.url || review?.avatar ? (
              <img
                src={review?.avatar?.url || review?.avatar}
                alt={review?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="font-jetbrains flex h-full w-full items-center justify-center bg-[#E37941] text-[14px] font-semibold text-white">
                {review?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-jetbrains text-[14px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
              {review.name}
            </h4>
            <p className="font-jetbrains text-[12px] tracking-wider text-[#7A736C] uppercase dark:text-[#9E9893]">
              {review.company}
            </p>
          </div>
        </div>
        {plainText && (
          <button
            onClick={() => onPlay(plainText, review._id)}
            className="flex items-center gap-2 rounded-full border border-[#D5D0C6] px-3 py-1.5 text-[#1A1A1A] transition-colors hover:bg-[#DED9CE] dark:border-[#3A352E] dark:text-[#F0EDE7] dark:hover:bg-[#2A2520]"
          >
            {isPlaying ? (
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
                <span className="font-jetbrains w-[30px] text-center text-[12px]">Play</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ProfessionalTestimonialsTab({ isEditing, reviews, onAddReview, onEditReview }) {
  const { openSidebar } = useGlobalContext();
  const [playingTestimonial, setPlayingTestimonial] = useState(null);

  const handlePlayTestimonial = useCallback(
    (text, id) => {
      if (playingTestimonial === id) {
        window.speechSynthesis.cancel();
        setPlayingTestimonial(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setPlayingTestimonial(null);
        window.speechSynthesis.speak(utterance);
        setPlayingTestimonial(id);
      }
    },
    [playingTestimonial]
  );

  return (
    <div className="group/section px-4 pb-20 md:px-6">
      {isEditing && (
        <div className="-mx-4 mb-2 flex items-center justify-end gap-2 border-b border-[#D5D0C6] px-1 py-2 md:-mx-6 dark:border-[#3A352E]">
          {(reviews || []).length >= 2 && (
            <ProfessionalRearrangeButton
              onClick={() => openSidebar(sidebars.sortReviews)}
              title="Rearrange testimonials"
              tooltipText="Rearrange"
            />
          )}
          <SectionVisibilityButton
            sectionId="reviews"
            showOnHoverWhenVisible
            className="h-8 w-8 rounded-full border-[#D5D0C6] bg-[#EFECE6] hover:bg-[#E5E0D8] dark:border-[#3A352E] dark:bg-[#1A1A1A] dark:hover:bg-[#2A2520]"
          />
        </div>
      )}
      <div className="mt-4 max-w-2xl">
        <div className="space-y-6">
          {(reviews || []).map((review) => (
            <TestimonialCard
              key={review._id}
              review={review}
              isEditing={isEditing}
              isPlaying={playingTestimonial === review._id}
              onPlay={handlePlayTestimonial}
              onEdit={onEditReview}
            />
          ))}
        </div>

        {isEditing && (
          <div className="mt-4 border-t border-dashed border-[#D5D0C6]/50 pt-6 dark:border-[#3A352E]/50">
            <button
              type="button"
              onClick={onAddReview}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#D5D0C6] bg-black/[0.02] py-4 text-[#7A736C] transition-all hover:border-[#1A1A1A] hover:bg-black/[0.04] hover:text-[#1A1A1A] dark:border-[#3A352E] dark:bg-white/[0.02] dark:text-[#9E9893] dark:hover:border-[#F0EDE7] dark:hover:bg-white/[0.04] dark:hover:text-[#F0EDE7]"
            >
              <Plus className="h-4 w-4" />
              <span className="font-jetbrains text-[13px] font-medium tracking-wider uppercase">
                Add New Testimonial
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProfessionalTestimonialsTab);
