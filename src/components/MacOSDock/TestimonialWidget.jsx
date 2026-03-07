import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import ReviewCard from "@/components/reviewCard";
import DragHandle from "@/components/DragHandle";
import { Button } from "@/components/ui/buttonNew";
import { extractTextFromTipTap } from "@/lib/tiptapUtils";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";
import { cn } from "@/lib/utils";

export const SortableTestimonialItem = ({ review, edit, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: review._id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 9999 : 1,
      }}
      className={`flex justify-between gap-4 items-center ${isDragging ? "relative" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <ReviewCard review={review} sorting={true} edit={edit} />
      </div>
      <div className="flex items-center flex-col gap-2 flex-shrink-0">
        {edit && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-foreground/5"
            onClick={() => onEdit(review)}
          >
            <Pencil className="w-4 h-4 text-df-icon-color" />
          </Button>
        )}
        <DragHandle size="sm" listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
};

const VIEW_MORE_THRESHOLD = 165;
const BODY_PX = 20;
const PADDING = 32;
const WIDGET_WIDTH = 320;

// Collapsed card total height — never changes during animation
const COLLAPSED_CARD_H = 200;
// Max quote text height in collapsed state
const COLLAPSED_QUOTE_H = 72;
// Footer height (divider + author + optional button) — fixed so it's always pinned
const FOOTER_H = 60;
// Expanded card height cap
const EXPANDED_CARD_H = 420;

export const TestimonialWidget = ({ reviews, edit, onEditClick, onAddReview }) => {
  const [expanded, setExpanded] = useState(false);
  const [width, setWidth] = useState(WIDGET_WIDTH);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

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
    if (!expanded && validReviews.length > 1) {
      const id = setInterval(() => {
        setCurrentQuoteIndex((i) => (i + 1) % validReviews.length);
      }, 4000);
      return () => clearInterval(id);
    }
  }, [expanded, validReviews.length]);

  if (validTestimonials.length === 0 && hasReviews) return null;

  const quoteIndex = Math.min(currentQuoteIndex, Math.max(0, validReviews.length - 1));
  const currentReview = validReviews[quoteIndex] ?? validReviews[0];
  const currentTestimonial = validTestimonials[quoteIndex] ?? validTestimonials[0];
  const isCurrentLong = currentTestimonial && currentTestimonial.text.length > VIEW_MORE_THRESHOLD;

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

  const cardHeight = expanded
    ? Math.min(EXPANDED_CARD_H, (typeof window !== "undefined" ? window.innerHeight : 800) * 0.7)
    : COLLAPSED_CARD_H;

  return (
    <div {...outerProps} style={{ width, overflow: "hidden" }}>
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center text-[#4A3708] font-medium text-[13px]">
        <span>Testimonials</span>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
          </div>
          {edit && !isEmpty && (
            <button
              onClick={onEditClick}
              className="text-[#4A3708] font-medium text-[13px] hover:underline cursor-pointer"
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
          className="bg-white rounded-xl relative overflow-hidden flex flex-col"
          style={{
            height: cardHeight,
            transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-xl z-0"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
            aria-hidden
          />

          {/* ── Quote zone ── fills available space, scrollable when expanded */}
          <div
            className={cn(
              "relative z-10 flex-1 min-h-0 pt-5",
              expanded ? "overflow-y-auto custom-scrollbar" : "overflow-hidden"
            )}
            style={{ paddingLeft: BODY_PX, paddingRight: BODY_PX, scrollbarWidth: "thin", scrollbarColor: "#C1C1C1 transparent" }}
          >
            {/*
             * Collapsed: clip text to COLLAPSED_QUOTE_H with a fade.
             * Expanded:  let text render at full height inside the scrollable zone.
             */}
            <div
              className={cn(
                "testimonial-widget-tiptap font-medium text-black/90 leading-relaxed relative",
                !expanded && "overflow-hidden"
              )}
              style={!expanded ? { maxHeight: COLLAPSED_QUOTE_H } : undefined}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview?._id ?? quoteIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                >
                  <SimpleTiptapRenderer
                    content={currentReview?.description ?? ""}
                    mode="review"
                    enableBulletList={false}
                    className={cn(
                      "rounded-none shadow-none bg-transparent min-w-0 [&_.ProseMirror]:min-h-0 [&_.ProseMirror]:p-0",
                      !expanded
                        ? "[&_.ProseMirror]:text-[14px]"
                        : "[&_.ProseMirror]:text-[15px]"
                    )}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Bottom fade-out when collapsed + long text */}
              {!expanded && isCurrentLong && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                  }}
                  aria-hidden
                />
              )}
            </div>
          </div>

          {/* ── Pinned footer ── always at bottom, never scrolls away */}
          <div
            className="relative z-10 flex-shrink-0"
            style={{ height: FOOTER_H }}
          >
            <div className="h-px w-full bg-black/5" />
            <div
              className="flex flex-col justify-center gap-2 h-full"
              style={{ paddingLeft: BODY_PX, paddingRight: BODY_PX }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={quoteIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  className="text-[11px] text-black/50 font-bold uppercase tracking-wider leading-none"
                >
                  {currentTestimonial?.author ?? "Client"}
                </motion.span>
              </AnimatePresence>

              {isCurrentLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="text-[11px] leading-none text-[#4A3708] hover:text-[#2d2204] font-semibold uppercase tracking-wider self-start transition-colors whitespace-nowrap cursor-pointer"
                >
                  {expanded ? "← Less" : "View more →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function TestimonialEmptyState() {
  return (
    <div className="bg-white rounded-xl flex flex-col items-center justify-center gap-3 min-h-[120px] py-8 px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4A3708]/10 text-[#4A3708]/70">
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <div className="text-center space-y-0.5">
        <p className="text-[#4A3708] font-semibold text-sm">No testimonials yet</p>
        <p className="text-[#4A3708]/60 text-xs">Tap to add your first review</p>
      </div>
    </div>
  );
}