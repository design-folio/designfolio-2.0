import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";
import Text from "./text";
import Button from "./button";
import EditIcon from "../../public/assets/svgs/edit.svg";
import LinkedInIcon from "../../public/assets/svgs/linkedin.svg";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ReviewCard({ className = "", review, edit = false }) {
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
  return (
    <div
      className={`bg-review-card-bg-color p-[16px] border flex flex-col justify-between border-review-card-border-color rounded-[16px] min-h-[208px] cursor-pointer ${className}`}
    >
      <Text
        size="p-xsmall"
        className="text-review-card-heading-color whitespace-pre-line break-all mt-2"
      >
        {review?.description.slice(
          0,
          !expandedCards.includes(review?._id)
            ? 180
            : review?.description?.length - 1
        )}
        {!expandedCards.includes(review?._id) ? (
          <button
            onClick={() => toggleExpand(review?._id)}
            className="ml-1 text-foreground hover:text-foreground/80 inline-flex items-center gap-1 underline underline-offset-4"
          >
            View More
            <ChevronDown className="h-3 w-3" />
          </button>
        ) : (
          <button
            onClick={() => toggleExpand(review?._id)}
            className="ml-1 text-foreground hover:text-foreground/80 inline-flex items-center gap-1 underline underline-offset-4"
          >
            Show Less
            <ChevronUp className="h-3 w-3" />
          </button>
        )}
      </Text>
      <div className="flex justify-between items-center">
        <div>
          {review.linkedinLink && review.linkedinLink !== "" ? (
            <a
              href={review.linkedinLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text size="p-xsmall" className="text-blue-500 mt-3">
                <LinkedInIcon className="text-df-icon-color mb-1" />{" "}
                {review?.name}
              </Text>
            </a>
          ) : (
            <Text size="p-xsmall" className="text-review-card-text-color mt-3">
              {review?.name}
            </Text>
          )}
          <Text
            size="p-xxsmall"
            className="text-review-card-description-color "
          >
            {review?.company}
          </Text>
        </div>
        {edit && (
          <Button
            onClick={handleEdit}
            type={"secondary"}
            icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
          />
        )}
      </div>
    </div>
  );
}
