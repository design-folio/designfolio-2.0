import { useGlobalContext } from "@/context/globalContext";
import Section from "./section";
import { twMerge } from "tailwind-merge";
import AddCard from "./AddCard";
import PenIcon from "../../public/assets/svgs/pen-icon.svg";
import ReviewCard from "./reviewCard";
import { modals } from "@/lib/constant";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/buttonNew";
import Button2 from "./button";
import { Plus, PlusIcon } from "lucide-react";
import AddItem from "./addItem";
import MemoTestimonial from "./icons/Testimonial";
import { useTheme } from "next-themes";
import Text from "./text";
import { cn } from "@/lib/utils";

export default function Reviews({ edit = false, userDetails, openModal }) {
  const reviews = userDetails?.reviews || [];
  const theme = useTheme();
  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
    >
      <Card
        className={cn("bg-df-section-card-bg-color backdrop-blur-sm border-0 rounded-2xl p-4 lg:p-8", userDetails?.wallpaper && userDetails?.wallpaper?.value != 0 && "bg-white/95 dark:bg-[#1d1f27]/95  backdrop-blur-sm")}
        style={{
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.03), 0 0 40px rgba(0,0,0,0.015)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <Text
            size="p-small"
            className="text-project-card-heading-color font-semibold"
          >
            Testimonials
          </Text>
          {edit && reviews.length > 0 && (
            <Button
              variant="secondary"
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

          {edit && reviews.length == 0 && (
            <AddItem
              className="bg-df-section-card-bg-color shadow-df-section-card-shadow mt-6"
              title="Add your testimonial"
              onClick={() => openModal(modals.review)}
              iconLeft={
                reviews?.length > 0 ? (
                  <Button2
                    type="secondary"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                    }
                    onClick={() => openModal(modals.review)}
                    size="small"
                    text
                  />
                ) : (
                  <MemoTestimonial />
                )
              }
              iconRight={
                reviews?.length == 0 ? (
                  <Button2
                    type="secondary"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                    }
                    onClick={() => openModal(modals.review)}
                    size="small"
                  />
                ) : (
                  false
                )
              }
              theme={theme}
            />
          )}
        </div>
      </Card>
    </motion.div>
  );
}
