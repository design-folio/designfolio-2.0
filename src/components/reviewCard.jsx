import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";
import Text from "./text";
import Button from "./button";
import EditIcon from "../../public/assets/svgs/edit.svg";

export default function ReviewCard({ className = "", review, edit = false }) {
  const { openModal, setSelectedReview } = useGlobalContext();
  const handleEdit = () => {
    openModal(modals.review);
    setSelectedReview(review);
  };
  return (
    <div
      className={`bg-review-card-bg-color p-[16px] border flex flex-col justify-between border-review-card-border-color rounded-[16px] min-h-[208px] cursor-pointer ${className}`}
    >
      <Text size="p-xsmall" className="text-review-card-heading-color mt-2">
        {review?.description}
      </Text>
      <div className="flex justify-between items-center">
        <div>
          <Text
            size="p-xsmall"
            className="text-review-card-description-color mt-3"
          >
            {review?.name}
          </Text>
          <Text size="p-xxsmall" className="text-review-card-text-color">
            {review?.company}
          </Text>
        </div>
        {edit && (
          <Button
            onClick={handleEdit}
            type={"secondary"}
            icon={<EditIcon className="text-df-icon-color" />}
          />
        )}
      </div>
    </div>
  );
}
