import { useGlobalContext } from "@/context/globalContext";
import Section from "./section";
import { twMerge } from "tailwind-merge";
import AddCard from "./AddCard";
import PenIcon from "../../public/assets/svgs/pen-icon.svg";
import ReviewCard from "./reviewCard";
import { modals } from "@/lib/constant";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Reviews({ edit = false, userDetails, openModal }) {
  const reviews = userDetails?.reviews || [];

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
    >
      <Card
        className="bg-df-section-card-bg-color backdrop-blur-sm border-0 rounded-2xl p-8 mt-3"
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.03), 0 0 40px rgba(0,0,0,0.015)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold" data-testid="text-testimonials-title">
            Testimonials
          </h2>
          {edit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => openModal(modals.review)}
              className="rounded-full h-11 w-11"
              data-testid="button-add-testimonial"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div
          className={twMerge(
            "grid grid-cols-1 md:grid-cols-2 gap-4",
            reviews.length == 0 && "md:grid-cols-1"
          )}
          style={{ gridAutoRows: "auto" }}
        >
          {reviews.map((review, i) => (
            <ReviewCard review={review} edit={edit} key={review?._id || i} index={i} />
          ))}

          {/* {edit && (
            <AddCard
              title={`${reviews.length == 0 ? "My testimonials" : "Add more reviews"
                } `}
              subTitle="Share colleague's feedback."
              onClick={() => openModal(modals.review)}
              className={
                reviews.length != 0 ? "w-full !min-h-[208px]" : "w-full"
              }
              first={reviews.length !== 0}
              buttonTitle="Add testimonial"
              icon={<PenIcon className="cursor-pointer" />}
            />
          )} */}
        </div>
      </Card>
    </motion.div>
  );
}
