import { useGlobalContext } from "@/context/globalContext";
import Section from "./section";
import { twMerge } from "tailwind-merge";
import AddCard from "./AddCard";
import PenIcon from "../../public/assets/svgs/pen-icon.svg";
import ReviewCard from "./reviewCard";
import { sidebars } from "@/lib/constant";
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
import React, { useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { _updateUser } from "@/network/post-request";
import Modal from "./modal";
import CloseIcon from "../../public/assets/svgs/close.svg";
import SortIcon from "../../public/assets/svgs/sort.svg";
import DragHandle from "./DragHandle";

export default function Reviews({ edit = false, openModal }) {

  const { setUserDetails, updateCache, userDetails } = useGlobalContext();
  const reviews = userDetails?.reviews || [];
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = userDetails.reviews.findIndex(
      (review) => review._id === active.id
    );
    const newIndex = userDetails.reviews.findIndex(
      (review) => review._id === over.id
    );

    const sortedReviews = arrayMove(
      userDetails.reviews,
      oldIndex,
      newIndex
    );

    setUserDetails((prev) => ({ ...prev, reviews: sortedReviews }));
    _updateUser({ reviews: sortedReviews }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  };

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
    >
      <Card
        className={cn("bg-df-section-card-bg-color backdrop-blur-sm border-0 rounded-2xl p-4 lg:p-8")}
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
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  setShowModal(true);
                }}
                className="rounded-full h-11 w-11"
              >
                <SortIcon className="w-4 h-4 text-df-icon-color cursor-pointer" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => openModal(sidebars.review)}
                className="rounded-full h-11 w-11"
                data-testid="button-add-testimonial"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
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
              onClick={() => openModal(sidebars.review)}
              iconLeft={
                reviews?.length > 0 ? (
                  <Button2
                    type="secondary"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                    }
                    onClick={() => openModal(sidebars.review)}
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
                    onClick={() => openModal(sidebars.review)}
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
      <Modal show={showModal}>
        <div className="rounded-2xl flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden bg-modal-bg-color">
          <div className="flex p-5 justify-between items-center">
            <Text size="p-small" className="font-semibold">
              Change the order
            </Text>
            <Button2
              type="secondary"
              customClass="!p-2"
              icon={<CloseIcon className="text-icon-color cursor-pointer" />}
              onClick={() => {
                setShowModal(false);
              }}
            />
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={userDetails?.reviews?.map((review) => review._id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div
                ref={scrollContainerRef}
                className="flex flex-col gap-4 py-5 px-5 list-none max-h-[450px] overflow-auto "
              >
                {userDetails?.reviews?.map((review) => (
                  <SortableReviewItem
                    key={review._id}
                    review={review}
                    edit={edit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="h-5" />
        </div>
      </Modal>
    </motion.div>
  );
}

const SortableReviewItem = ({ review, edit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: review._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex justify-between gap-4 items-center ${isDragging ? 'relative' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <ReviewCard review={review} sorting={true} edit={edit} />
      </div>
      <div className="flex-shrink-0">
        <DragHandle listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
};
