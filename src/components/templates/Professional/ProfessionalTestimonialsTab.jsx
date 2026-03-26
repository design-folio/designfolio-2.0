import React, { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Play, Plus, Square } from "lucide-react";
import { extractText } from "./professional-utils";

function TestimonialCard({ review, isEditing, isPlaying, onPlay, onEdit }) {
  const reviewText = extractText(review?.description);

  return (
    <div className="group border border-[#D5D0C6] dark:border-[#3A352E] p-6 rounded-sm hover:bg-[#DED9CE]/30 dark:hover:bg-white/[0.02] transition-colors relative">
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 transition-opacity flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white/90 dark:bg-[#2A2520]/90 backdrop-blur-sm border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(review);
            }}
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
          </Button>
        </div>
      )}
      <p className="font-['Inter'] text-[#1A1A1A] dark:text-[#F0EDE7] text-[16px] leading-relaxed mb-6 italic relative z-10">
        &ldquo;{reviewText}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#D5D0C6] dark:bg-[#3A352E] overflow-hidden">
            {review?.avatar?.url || review?.avatar ? (
              <img
                src={review?.avatar?.url || review?.avatar}
                alt={review?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-jetbrains text-[14px] font-semibold text-white bg-[#E37941]">
                {review?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-jetbrains text-[#1A1A1A] dark:text-[#F0EDE7] text-[14px] font-semibold">
              {review.name}
            </h4>
            <p className="font-jetbrains text-[#7A736C] dark:text-[#9E9893] text-[12px] uppercase tracking-wider">
              {review.company}
            </p>
          </div>
        </div>
        {reviewText && (
          <button
            onClick={() => onPlay(reviewText, review._id)}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#D5D0C6] dark:border-[#3A352E] rounded-full text-[#1A1A1A] dark:text-[#F0EDE7] hover:bg-[#DED9CE] dark:hover:bg-[#2A2520] transition-colors"
          >
            {isPlaying ? (
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
                <span className="font-jetbrains text-[12px] w-[30px] text-center">
                  Play
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ProfessionalTestimonialsTab({
  isEditing,
  reviews,
  onAddReview,
  onEditReview,
}) {
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
    [playingTestimonial],
  );

  return (
    <div className="p-4 md:p-6 pb-12 relative group/section">
      {isEditing && (
        <div className="absolute -top-3 right-4 md:right-6 transition-opacity z-10 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] border-[#E5D7C4] dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-[#35302A]"
            onClick={onAddReview}
          >
            <Plus className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              Add Testimonial
            </span>
          </Button>
        </div>
      )}
      <div className="max-w-2xl space-y-6">
        {reviews.map((review) => (
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
    </div>
  );
}

export default memo(ProfessionalTestimonialsTab);
