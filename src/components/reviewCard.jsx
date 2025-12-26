import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { Button } from "./ui/buttonNew";
import { useState } from "react";
import { ChevronDown, ChevronUp, PencilIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MemoLinkedin from "./icons/Linkedin";
import SimpleTiptapRenderer from "./SimpleTiptapRenderer";
import { getPlainTextLength } from "@/lib/tiptapUtils";

export default function ReviewCard({ review, edit = false }) {
  const { openSidebar, setSelectedReview, selectedReview, activeSidebar } = useGlobalContext();
  const [expandedCards, setExpandedCards] = useState([]);

  // Check if this review is currently being edited (sidebar is open and this review is selected)
  const isEditing = activeSidebar === sidebars.review && selectedReview?._id === review?._id;

  const handleEdit = () => {
    setSelectedReview(review);
    openSidebar(sidebars.review);
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const isExpanded = expandedCards.includes(review?._id);
  const plainTextLength = getPlainTextLength(review?.description || "");
  const shouldShowToggle = plainTextLength > 180;

  return (
    <div
      key={review?._id}
      className={`bg-review-card-bg-color border-2 rounded-2xl p-6 flex flex-col hover-elevate transition-all ${isEditing
        ? "border-default-cursor-box-border shadow-review-card-editing focus-within:shadow-review-card-focus-ring"
        : "border-border/30 shadow-review-card-default"
        }`}
    >
      {/* Review Text with Edit button */}
      <div className="flex items-start gap-2 mb-6 flex-1">
        <div className="flex-1">
          <div className={shouldShowToggle && !isExpanded ? "max-h-[110px]  overflow-hidden relative" : ""}>
            <SimpleTiptapRenderer
              content={review?.description || ""}
              mode="review"
              enableBulletList={false}
            />
            {shouldShowToggle && !isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-review-card-bg-color to-transparent pointer-events-none" />
            )}
          </div>
          {shouldShowToggle && (
            <button
              onClick={() => toggleExpand(review?._id)}
              className="mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
            >
              {isExpanded ? (
                <>
                  Show Less
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  View More
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>
        {edit && (
          <Button
            onClick={handleEdit}
            variant={"secondary"}
            className="h-8 w-8 rounded-full hover:bg-foreground/5 shrink-0"
          >
            <PencilIcon className="text-df-icon-color w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Avatar + User Info */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 shrink-0">
          <AvatarImage src={review?.avatar?.url || review?.avatar} alt={review?.name} />
          <AvatarFallback
            style={{
              backgroundColor: "#FF9966",
              color: "#FFFFFF",
              fontWeight: 500,
            }}
          >
            {review?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          {review.linkedinLink && review.linkedinLink !== "" ? (
            <a
              href={review.linkedinLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500"
            >
              <MemoLinkedin className="text-df-icon-color w-4 h-4" />
              <span className="font-semibold text-base">{review?.name}</span>
            </a>
          ) : (
            <h3 className="font-semibold text-base mb-0">{review?.name}</h3>
          )}
          <p className="text-sm text-foreground/50">
            {review?.role ? `${review.role}, ` : ""}
            {review?.company}
          </p>
        </div>
      </div>
    </div>
  );
}
