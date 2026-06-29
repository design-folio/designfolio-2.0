import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pencil, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import ReviewCard from "@/components/reviewCard";
import DragHandle from "@/components/DragHandle";
import { Button } from "@/components/ui/buttonNew";
import { extractTextFromTipTap } from "@/lib/tiptapUtils";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MemoLinkedin from "@/components/icons/Linkedin";

export const SortableTestimonialItem = ({ review, edit, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: review._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 9999 : 1,
      }}
      className={`flex items-center justify-between gap-4 ${isDragging ? "relative" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <ReviewCard review={review} sorting={true} edit={edit} />
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2">
        {edit && (
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-foreground/5 h-8 w-8 rounded-full"
            onClick={() => onEdit(review)}
          >
            <Pencil className="text-df-icon-color h-4 w-4" />
          </Button>
        )}
        <DragHandle size="sm" listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
};

const BODY_PX = 20;
const PADDING = 32;
const WIDGET_WIDTH = 320;

// Max height caps (card sizes to content up to these)
const COLLAPSED_MAX_H = 200;
const EXPANDED_CARD_H = 420;
/** Roughly 3 lines; above this, Expand is useful to read more */
const LONG_TEXT_THRESHOLD = 165;

export const TestimonialWidget = ({ reviews, edit, onEditClick, onAddReview }) => {
  const [expanded, setExpanded] = useState(false);
  const [width, setWidth] = useState(WIDGET_WIDTH);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const maxW = typeof window !== "undefined" ? window.innerWidth - PADDING : 9999;
      setWidth(Math.min(WIDGET_WIDTH, maxW));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const hasReviews = reviews && reviews.length > 0;
  const validReviews = hasReviews
    ? reviews.filter((r) => extractTextFromTipTap(r.description)?.trim())
    : [];
  const testimonials = hasReviews
    ? reviews.map((r) => ({
        text: extractTextFromTipTap(r.description) || "",
        author: r.name || r.author || "Client",
      }))
    : [];
  const validTestimonials = testimonials.filter((t) => t.text);

  useEffect(() => {
    if (!expanded && !isHovered && validReviews.length > 1) {
      const id = setInterval(() => {
        setCurrentQuoteIndex((i) => (i + 1) % validReviews.length);
      }, 4000);
      return () => clearInterval(id);
    }
  }, [expanded, isHovered, validReviews.length]);

  if (validTestimonials.length === 0 && hasReviews) return null;

  const quoteIndex = Math.min(currentQuoteIndex, Math.max(0, validReviews.length - 1));
  const currentReview = validReviews[quoteIndex] ?? validReviews[0];
  const currentTestimonial = validTestimonials[quoteIndex] ?? validTestimonials[0];

  const isEmpty = !hasReviews;
  const outerProps = isEmpty
    ? {
        role: "button",
        tabIndex: 0,
        onClick: () => onAddReview?.(),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAddReview?.();
          }
        },
        className:
          "bg-[#F5C75D] rounded-2xl p-1 shadow-lg font-sans max-w-[calc(100vw-32px)] cursor-pointer hover:opacity-95 transition-opacity",
      }
    : { className: "bg-[#F5C75D] rounded-2xl p-1 shadow-lg font-sans max-w-[calc(100vw-32px)]" };

  const expandedMaxHeight =
    typeof window !== "undefined"
      ? Math.min(EXPANDED_CARD_H, window.innerHeight * 0.7)
      : EXPANDED_CARD_H;

  const isCurrentLong = (currentTestimonial?.text?.length ?? 0) > LONG_TEXT_THRESHOLD;
  const showExpandShrink = expanded || isCurrentLong;

  return (
    <div {...outerProps} style={{ width, overflow: "hidden" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-[13px] font-medium text-[#4A3708]">
        <span>Testimonials</span>
        <div className="flex items-center gap-3">
          {!isEmpty && showExpandShrink ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-[#4A3708] hover:underline"
            >
              {expanded ? (
                <>
                  Shrink <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Expand <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-1" aria-hidden>
              <div className="h-1 w-1 rounded-full bg-[#4A3708]/40" />
              <div className="h-1 w-1 rounded-full bg-[#4A3708]/40" />
              <div className="h-1 w-1 rounded-full bg-[#4A3708]/40" />
            </div>
          )}
          {edit && !isEmpty && (
            <button
              onClick={onEditClick}
              className="cursor-pointer text-[13px] font-medium text-[#4A3708] hover:underline"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {isEmpty ? (
        <TestimonialEmptyState />
      ) : (
        <div
          className="relative flex flex-col overflow-hidden rounded-xl bg-white"
          style={{
            height: "auto",
            maxHeight: expanded ? expandedMaxHeight : COLLAPSED_MAX_H,
            transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* ── Quote zone ── both states: size to content; scroll when over max */}
          <div
            className={cn(
              "relative z-10 min-h-0",
              isCurrentLong ? "pt-5" : "py-5",
              expanded ? "custom-scrollbar overflow-y-auto" : "overflow-hidden"
            )}
            style={{
              paddingLeft: BODY_PX,
              paddingRight: BODY_PX,
              scrollbarWidth: "thin",
              scrollbarColor: "#C1C1C1 transparent",
              maxHeight: expanded ? expandedMaxHeight - 80 : COLLAPSED_MAX_H - 80,
            }}
          >
            {/*
             * Collapsed: CSS line-clamp so text truncates with "..." (no height-based clip).
             * Expanded: full text, scrollable.
             */}
            <div
              className={cn(
                "relative leading-relaxed font-medium text-black/90",
                !expanded &&
                  "line-clamp-3 [&_.ProseMirror]:line-clamp-3 [&_.ProseMirror]:overflow-hidden [&_.ProseMirror]:break-words"
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview?._id ?? quoteIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  className={!expanded ? "line-clamp-3 overflow-hidden" : undefined}
                >
                  <SimpleTiptapRenderer
                    content={currentReview?.description ?? ""}
                    mode="review"
                    enableBulletList={false}
                    className={cn(
                      "min-w-0 rounded-none bg-transparent shadow-none [&_.ProseMirror]:min-h-0 [&_.ProseMirror]:p-0",
                      !expanded
                        ? "[&_.ProseMirror]:line-clamp-3 [&_.ProseMirror]:overflow-hidden [&_.ProseMirror]:text-[14px]"
                        : "[&_.ProseMirror]:text-[14px]"
                    )}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Pinned footer ── avatar, author, LinkedIn */}
          <div className="relative z-10 shrink-0">
            <div className="h-px w-full bg-black/5" />
            <div
              className="flex h-full flex-wrap items-center gap-3 py-2"
              style={{ paddingLeft: BODY_PX, paddingRight: BODY_PX }}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage
                  src={currentReview?.avatar?.url || currentReview?.avatar}
                  alt={currentReview?.name}
                />
                <AvatarFallback className="bg-[#F5C75D]/50 text-xs font-medium text-[#4A3708]">
                  {currentReview?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                <div className="flex items-center gap-1.5">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={quoteIndex}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                      className="text-[11px] leading-none font-bold tracking-wider text-black/50 uppercase"
                    >
                      {currentTestimonial?.author ?? "Client"}
                    </motion.span>
                  </AnimatePresence>
                  {currentReview?.linkedinLink && currentReview.linkedinLink.trim() !== "" && (
                    <a
                      href={currentReview.linkedinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-0.5 text-[#0A66C2] transition-opacity hover:opacity-80"
                      aria-label="LinkedIn profile"
                    >
                      <MemoLinkedin className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function TestimonialEmptyState() {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl bg-white px-6 py-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4A3708]/10 text-[#4A3708]/70">
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <div className="space-y-0.5 text-center">
        <p className="text-sm font-semibold text-[#4A3708]">No testimonials yet</p>
        <p className="text-xs text-[#4A3708]/60">Tap to add your first review</p>
      </div>
    </div>
  );
}
