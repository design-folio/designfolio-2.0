import { Button } from "@/components/ui/buttonNew";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import { _updateUser } from "@/network/post-request";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from "framer-motion";
import { Plus, PlusIcon, Pencil, Linkedin, QuoteIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import SortIcon from "../../public/assets/svgs/sort.svg";
import AddItem from "./addItem";
import Button2 from "./button";
import DragHandle from "./DragHandle";
import MemoTestimonial from "./icons/Testimonial";
import ReviewCard from "./reviewCard";
import Section from "./section";
import SortableModal from "./SortableModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SimpleTiptapRenderer from "./SimpleTiptapRenderer";
import MemoQuoteIcon from "./icons/QuoteIcon";

export default function Reviews({ edit = false, openModal, userDetails }) {

  const { setUserDetails, updateCache, setSelectedReview } = useGlobalContext();
  const reviews = userDetails?.reviews || [];
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  const toggleExpandReview = (id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
      <Section
        title="Testimonials"
        edit={edit && reviews.length > 0}
        actions={
          edit && reviews.length > 0 ? (
            <div className="flex items-center gap-2">
              {reviews.length > 1 && (
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
              )}
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
          ) : null
        }
        wallpaper={userDetails?.wallpaper}
      >
        {reviews.length > 0 ? (
          <div className="mt-6 -mx-4 lg:-mx-6 px-4 lg:px-6 overflow-visible relative">
            <Carousel
              opts={{
                align: "start",
                loop: reviews.length >= 2,
              }}
              className="w-full overflow-visible"
            >
              <div className="overflow-visible">
                <CarouselContent className="-ml-4 lg:-ml-6 pr-4 lg:pr-6">
                  {(reviews.length >= 2 ? [...reviews, ...reviews, ...reviews] : reviews).map((review, idx) => (
                    <CarouselItem key={`${review._id}-${idx}`} className="pl-4 lg:pl-6 md:basis-1/2 overflow-visible py-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="group rounded-2xl p-6 flex flex-col relative transition-all duration-300 h-full bg-review-card-bg-color hover-elevate border border-border/50"
                      // style={{
                      //   boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 0 40px rgba(0,0,0,0.015)'
                      // }}
                      >
                        <div className="mb-4 mt-2 flex items-center justify-between">
                          <MemoQuoteIcon className="text-df-icon-color opacity-20" />

                          {edit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedReview(review);
                                openModal(sidebars.review);
                              }}
                            >
                              <Pencil className="w-4 h-4 text-df-icon-color" />
                            </Button>
                          )}
                        </div>

                        <div className="flex-1 mb-8">
                          <div className="text-base leading-relaxed text-df-description-color">
                            {(() => {
                              const id = review?._id ?? `${idx}`;
                              const plainTextLength = getPlainTextLength(review?.description || "");
                              const shouldShowToggle = plainTextLength > 180;
                              const isExpanded = expandedReviewIds.includes(id);

                              return (
                                <>
                                  <div className={shouldShowToggle && !isExpanded ? "max-h-[110px] overflow-hidden relative" : ""}>
                                    <SimpleTiptapRenderer
                                      content={review?.description || ""}
                                      mode="review"
                                      enableBulletList={false}
                                      className="rounded-none shadow-none"
                                    />
                                    {shouldShowToggle && !isExpanded && (
                                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-review-card-bg-color to-transparent pointer-events-none" />
                                    )}
                                  </div>

                                  {shouldShowToggle && (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandReview(id)}
                                      className="mt-2 text-df-description-color hover:text-df-heading-color inline-flex items-center gap-1 underline underline-offset-4"
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
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-auto">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 shrink-0 rounded-xl">
                              <AvatarImage src={review?.avatar?.url || review?.avatar} alt={review?.name} />
                              <AvatarFallback className="rounded-none" style={{ backgroundColor: '#FF9966', color: '#FFFFFF' }}>
                                {review?.name?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <h3 className="font-semibold text-sm mb-0.5 text-df-heading-color">
                                {review?.name}
                              </h3>
                              <p className="text-xs text-df-description-color">
                                {review?.role ? `${review.role}, ` : ""}
                                {review?.company}
                              </p>
                            </div>
                          </div>
                          {review.linkedinLink && review.linkedinLink?.trim() !== "" && (
                            <a
                              href={review.linkedinLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground-landing/20 hover:text-[#0077B5] transition-colors p-2 -mr-2"
                            >
                              <Linkedin className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
              {reviews.length >= 2 && (
                <div className="flex justify-center gap-16 mt-4">
                  <CarouselPrevious className="static h-10 w-10 rounded-full border-border/50 bg-df-bg-color shadow-sm transition-all translate-y-0" />
                  <CarouselNext className="static bg-df-bg-color h-10 w-10 rounded-full border-border/50 shadow-sm transition-all translate-y-0" />
                </div>
              )}
            </Carousel>
          </div>
        ) : (
          edit && (
            <div className="mt-6">
              <AddItem
                className="bg-df-section-card-bg-color shadow-df-section-card-shadow"
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
            </div>
          )
        )}
      </Section>
      <SortableModal
        show={showModal}
        onClose={() => setShowModal(false)}
        items={userDetails?.reviews?.map((review) => review._id) || []}
        onSortEnd={handleDragEnd}
        sensors={sensors}
        useButton2={true}
      >
        {userDetails?.reviews?.map((review) => (
          <SortableReviewItem
            key={review._id}
            review={review}
            edit={edit}
          />
        ))}
      </SortableModal>
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
