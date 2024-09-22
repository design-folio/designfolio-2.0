import { useGlobalContext } from "@/context/globalContext";
import Section from "./section";
import { twMerge } from "tailwind-merge";
import AddCard from "./AddCard";
import PenIcon from "../../public/assets/svgs/pen-icon.svg";
import ReviewCard from "./reviewCard";
import { modals } from "@/lib/constant";
export default function Reviews({ edit = false }) {
  const { userDetails, openModal } = useGlobalContext();
  return (
    <Section title={"Reviews"}>
      <div
        className={twMerge(
          "grid gap-4 md:grid-cols-2",
          userDetails?.reviews?.length == 0 && "md:grid-cols-1"
        )}
      >
        {userDetails?.reviews.map((review, i) => (
          <ReviewCard review={review} edit={edit} key={i} />
        ))}
        {edit && (
          <AddCard
            title={`${
              userDetails?.reviews?.length == 0
                ? "My testimonials"
                : "Add more reviews"
            } `}
            subTitle="Share colleague's feedback."
            onClick={() => openModal(modals.review)}
            className={
              userDetails?.reviews?.length != 0
                ? "w-full !min-h-[208px]"
                : "w-full"
            }
            first={userDetails?.reviews?.length !== 0}
            buttonTitle="Add testimonial"
            icon={<PenIcon />}
          />
        )}
      </div>
    </Section>
  );
}
