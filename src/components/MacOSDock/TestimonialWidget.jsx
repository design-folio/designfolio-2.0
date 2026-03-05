import { useState, useEffect } from "react";
import { LayoutGroup } from "framer-motion";
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

const COLLAPSED_CHARS = 120;
const VIEW_MORE_THRESHOLD = 165;
const COLLAPSED_BODY_HEIGHT = 150;
const BODY_PX = 20;
const PADDING = 32;
const WIDGET_WIDTH = 320;

export const TestimonialWidget = ({ reviews, edit, onEditClick }) => {
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

  const testimonials =
    reviews?.length > 0
      ? reviews.map((r) => ({
          text: extractTextFromTipTap(r.description) || "",
          author: r.name || r.author || "Client",
        }))
      : defaultTestimonials;

  const validTestimonials = testimonials.filter((t) => t.text);
  if (validTestimonials.length === 0) return null;

  const displayTexts = validTestimonials.map((t) =>
    !expanded && t.text.length > COLLAPSED_CHARS
      ? t.text.slice(0, COLLAPSED_CHARS).trimEnd() + "…"
      : t.text
  );

  const currentTestimonial = validTestimonials[currentQuoteIndex];
  const isCurrentLong = currentTestimonial && currentTestimonial.text.length > VIEW_MORE_THRESHOLD;


  return (
    <div
      className="bg-[#F5C75D] rounded-2xl p-1 shadow-lg font-sans max-w-[calc(100vw-32px)]"
      style={{ width, overflow: "hidden" }}
    >
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

      <div
        className="bg-white rounded-xl relative overflow-x-hidden flex flex-col py-5"
        style={{
          height: expanded ? "auto" : COLLAPSED_BODY_HEIGHT,
          maxHeight: expanded ? "min(70vh, 420px)" : undefined,
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
          <div className="relative z-10 flex flex-col gap-3 flex-1 min-h-0">
            <div
              className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden"
              style={{ maxHeight: expanded ? "min(70vh, 380px)" : undefined }}
            >
              <div style={{ paddingLeft: BODY_PX, paddingRight: BODY_PX }}>
                <TextRotate
                  texts={displayTexts}
                  staggerFrom="first"
                  staggerDuration={0.01}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={4000}
                  auto={!expanded}
                  onNext={setCurrentQuoteIndex}
                  splitBy="words"
                  mainClassName={`font-medium text-black/90 leading-relaxed italic ${
                    expanded ? "text-[16px]" : "text-[14px]"
                  }`}
                />
              </div>
            </div>
            <div className="h-px w-full bg-black/5 flex-shrink-0" />
            <div
              className="flex flex-col gap-2 flex-shrink-0"
              style={{ paddingLeft: BODY_PX, paddingRight: BODY_PX }}
            >
              <TextRotate
                texts={validTestimonials.map((t) => t.author)}
                staggerFrom="first"
                staggerDuration={0.025}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={4000}
                auto={!expanded}
                splitBy="characters"
                mainClassName="text-[11px] text-black/50 font-bold uppercase tracking-wider"
              />
              {isCurrentLong && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-[11px] text-[#4A3708]/60 hover:text-[#4A3708] font-semibold uppercase tracking-wider self-start transition-colors"
                >
                  {expanded ? "← Less" : "View more →"}
                </button>
              )}
            </div>
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
};
