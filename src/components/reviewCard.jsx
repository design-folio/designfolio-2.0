import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";
import { Button } from "./ui/buttonNew";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, PencilIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MemoLinkedin from "./icons/Linkedin";

export default function ReviewCard({ className = "", review, edit = false, index = 0 }) {
  const { openModal, setSelectedReview } = useGlobalContext();
  const [expandedCards, setExpandedCards] = useState([]);

  const handleEdit = () => {
    openModal(modals.review);
    setSelectedReview(review);
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const isExpanded = expandedCards.includes(review?._id);

  // Highlight logic — highlight any **...** text
  const highlightText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.replace(/\*\*/g, "");
        return (
          <span
            key={i}
            className="marker-highlight animate px-0.5 rounded-sm"
          >
            {clean}
          </span>
        );
      }
      return part;
    });
  };

  const shouldShowToggle = review?.description?.length > 180;

  return (
    <motion.div
      key={review?._id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-review-card-bg-color border border-border/30 rounded-2xl p-6 flex flex-col hover-elevate transition-all`}
      style={{
        boxShadow:
          "0 0 0 1px rgba(0,0,0,0.03), 0 0 40px rgba(0,0,0,0.015)",
      }}
    >
      {/* Review Text with Edit button */}
      <div className="flex items-start gap-2 mb-6 flex-1">
        <p className="text-base leading-relaxed text-foreground flex-1">
          {highlightText(
            isExpanded ? review?.description : review?.description?.slice(0, 180)
          )}
          {shouldShowToggle && !isExpanded && review?.description?.length > 180 && "..."}
          {shouldShowToggle && (
            <button
              onClick={() => toggleExpand(review?._id)}
              className="ml-1 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
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
        </p>
        {edit && (
          <Button
            onClick={handleEdit}
            variant={"secondary"}
            className="h-8 w-8 rounded-full hover:bg-foreground/5 shrink-0"
          > <PencilIcon className="text-df-icon-color w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Avatar + User Info */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 shrink-0">
          <AvatarImage src={review?.avatar} alt={review?.name} />
          <AvatarFallback
            style={{
              backgroundColor: "#FFB088",
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
    </motion.div>
  );
}
