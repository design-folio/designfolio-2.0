import { useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import ReviewCard from "@/components/reviewCard";
import DragHandle from "@/components/DragHandle";
import { Button } from "@/components/ui/buttonNew";
import { TextRotate } from "@/components/ui/text-rotate";
import { extractTextFromTipTap } from "@/lib/tiptapUtils";

const defaultTestimonials = [
  { text: "An exceptional designer who brings ideas to life.", author: "Happy Client" },
  { text: "Delivered beyond expectations, every time.", author: "Satisfied Partner" },
];

// ─── SortableTestimonialItem ──────────────────────────────────────────────────

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
      <div className="flex items-center gap-2 flex-shrink-0">
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
        <DragHandle listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
};

// ─── TestimonialWidget ────────────────────────────────────────────────────────

const COLLAPSED_CHARS = 120;

export const TestimonialWidget = ({ reviews, edit, onEditClick }) => {
  const [expanded, setExpanded] = useState(false);

  const testimonials =
    reviews?.length > 0
      ? reviews.map((r) => ({
          text: extractTextFromTipTap(r.description) || "",
          author: r.name || r.author || "Client",
        }))
      : defaultTestimonials;

  const validTestimonials = testimonials.filter((t) => t.text);
  if (validTestimonials.length === 0) return null;

  // Truncate text in collapsed state so TextRotate never grows past one read
  const displayTexts = validTestimonials.map((t) =>
    !expanded && t.text.length > COLLAPSED_CHARS
      ? t.text.slice(0, COLLAPSED_CHARS).trimEnd() + "…"
      : t.text
  );

  return (
    // Only animate width — height stays h-auto and is naturally controlled by content
    <motion.div
      animate={{ width: expanded ? 480 : 320 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="bg-[#F5C75D] rounded-2xl p-1 shadow-lg font-sans"
      style={{ overflow: "hidden" }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center text-[#4A3708] font-medium text-[13px]">
        <span>Testimonials</span>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
            <div className="w-1 h-1 rounded-full bg-[#4A3708]/40" />
          </div>
          {edit ? (
            <button
              onClick={onEditClick}
              className="text-[#4A3708] font-medium text-[13px] hover:underline cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <span>Done</span>
          )}
        </div>
      </div>

      {/* Body — fixed height in collapsed state, auto when expanded */}
      <div
        className="bg-white rounded-xl p-5 relative"
        style={{
          height: expanded ? "auto" : 130,
          overflow: "hidden",
          transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-xl"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <LayoutGroup>
          <div className="relative z-10 flex flex-col gap-3">
            <TextRotate
              texts={displayTexts}
              staggerFrom="first"
              staggerDuration={0.01}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={4000}
              splitBy="words"
              mainClassName={`font-medium text-black/90 leading-relaxed italic ${
                expanded ? "text-[16px]" : "text-[14px]"
              }`}
            />
            <div className="h-px w-full bg-black/5" />
            <TextRotate
              texts={validTestimonials.map((t) => t.author)}
              staggerFrom="first"
              staggerDuration={0.025}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={4000}
              splitBy="characters"
              mainClassName="text-[11px] text-black/50 font-bold uppercase tracking-wider"
            />
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[11px] text-[#4A3708]/60 hover:text-[#4A3708] font-semibold uppercase tracking-wider self-start transition-colors"
            >
              {expanded ? "← Less" : "View more →"}
            </button>
          </div>
        </LayoutGroup>
      </div>
    </motion.div>
  );
};
