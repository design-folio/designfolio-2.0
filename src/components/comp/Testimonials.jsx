import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  EditIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import PlusIcon from "../../../public/assets/svgs/plus.svg";
import SortIcon from "../../../public/assets/svgs/sort.svg";
import AddItem from "../addItem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { useTheme } from "next-themes";
import Button2 from "../button";
import MemoLinkedin from "../icons/Linkedin";
import MemoTestimonial from "../icons/Testimonial";
import SimpleTiptapRenderer from "../SimpleTiptapRenderer";
import { Button } from "../ui/button";
import { getPlainTextLength } from "@/lib/tiptapUtils";
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { _updateUser } from "@/network/post-request";
import SortableModal from "../SortableModal";
import ReviewCard from "../reviewCard";
import DragHandle from "../DragHandle";
import { Button as ButtonNew } from "../ui/buttonNew";

export const Testimonials = ({ userDetails, edit }) => {
  const { reviews } = userDetails || {};
  const [showMore, setShowMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState([]);
  const [showSortModal, setShowSortModal] = useState(false);
  const isMobile = useIsMobile();
  const visibleTestimonials = showMore ? reviews : reviews?.slice(0, 4);
  const theme = useTheme();
  const { openSidebar, setSelectedReview, setUserDetails, updateCache } = useGlobalContext();

  const sortSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSortEnd = (event) => {
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

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= visibleTestimonials.length ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? visibleTestimonials.length - 1 : prev - 1
    );
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const handleClick = (review) => {
    setSelectedReview(review);
    openSidebar(sidebars.review);
  };

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-12 text-center">What People Say</h2>

      <div
        className={`relative ${isMobile ? "px-4" : "grid grid-cols-2 gap-6 max-w-4xl mx-auto px-4"
          }`}
      >
        {isMobile ? (
          <>
            {visibleTestimonials?.length > 0 && (
              <>
                <AnimatePresence initial={false} custom={currentIndex}>
                  <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      rotate: 2,
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{
                      rotate: 4,
                      transition: { duration: 0.2 },
                    }}
                    className="bg-review-card-bg-color border border-border/30 rounded-2xl p-6 flex flex-col hover-elevate transition-all"
                    style={{
                      boxShadow:
                        "0 0 0 1px rgba(0,0,0,0.03), 0 0 40px rgba(0,0,0,0.015)",
                    }}
                  >
                    <div className="flex items-start gap-2 mb-6 flex-1">
                      <div className="flex-1">
                        {(() => {
                          const currentTestimonial = visibleTestimonials[currentIndex];
                          const isExpanded = expandedCards.includes(currentTestimonial?._id);
                          const plainTextLength = getPlainTextLength(currentTestimonial?.description || "");
                          const shouldShowToggle = plainTextLength > 180;

                          return (
                            <>
                              <div className={shouldShowToggle && !isExpanded ? "max-h-[110px] overflow-hidden relative" : ""}>
                                <SimpleTiptapRenderer
                                  content={currentTestimonial?.description || ""}
                                  mode="review"
                                  enableBulletList={false}
                                />
                                {shouldShowToggle && !isExpanded && (
                                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-review-card-bg-color to-transparent pointer-events-none" />
                                )}
                              </div>
                              {shouldShowToggle && (
                                <button
                                  onClick={() => toggleExpand(currentTestimonial?._id)}
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
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 shrink-0">
                        <AvatarImage
                          src={visibleTestimonials[currentIndex]?.avatar?.url || visibleTestimonials[currentIndex]?.avatar}
                          alt={visibleTestimonials[currentIndex]?.name}
                        />
                        <AvatarFallback
                          style={{
                            backgroundColor: "#FF9966",
                            color: "#FFFFFF",
                            fontWeight: 500,
                          }}
                        >
                          {visibleTestimonials[currentIndex]?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        {visibleTestimonials[currentIndex]?.linkedinLink &&
                          visibleTestimonials[currentIndex]?.linkedinLink?.trim() !== "" ? (
                          <a
                            href={visibleTestimonials[currentIndex]?.linkedinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <MemoLinkedin className="text-df-icon-color w-4 h-4 cursor-pointer" />
                            <span className="font-semibold text-base cursor-pointer">
                              {visibleTestimonials[currentIndex]?.name}
                            </span>
                          </a>
                        ) : (
                          <h3 className="font-semibold text-base mb-0">
                            {visibleTestimonials[currentIndex]?.name}
                          </h3>
                        )}
                        <p className="text-sm text-df-description-color">
                          {visibleTestimonials[currentIndex]?.role
                            ? `${visibleTestimonials[currentIndex]?.role}, `
                            : ""}
                          {visibleTestimonials[currentIndex]?.company}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <AnimatePresence initial={false}>
            {visibleTestimonials?.map((testimonial, index) => (
              <motion.div
                key={testimonial.id ?? index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: index % 2 === 0 ? 2 : -2,
                }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{
                  rotate: index % 2 === 0 ? 4 : -4,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="bg-review-card-bg-color border border-border/30 rounded-2xl p-6 flex flex-col hover-elevate transition-all"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(0,0,0,0.03), 0 0 40px rgba(0,0,0,0.015)",
                }}
              >
                <div className="flex items-start gap-2 mb-6 flex-1">
                  <div className="flex-1">
                    {(() => {
                      const isExpanded = expandedCards.includes(testimonial._id);
                      const plainTextLength = getPlainTextLength(testimonial.description || "");
                      const shouldShowToggle = plainTextLength > 180;

                      return (
                        <>
                          <div className={shouldShowToggle && !isExpanded ? "max-h-[110px]  overflow-hidden relative" : ""}>
                            <SimpleTiptapRenderer
                              className="rounded-none shadow-none"
                              content={testimonial.description || ""}
                              mode="review"
                              enableBulletList={false}
                            />
                            {shouldShowToggle && !isExpanded && (
                              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-review-card-bg-color to-transparent pointer-events-none" />
                            )}
                          </div>
                          {shouldShowToggle && (
                            <button
                              onClick={() => toggleExpand(testimonial._id)}
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
                        </>
                      );
                    })()}
                  </div>
                  {edit && (
                    <Button2
                      onClick={() => handleClick(testimonial)}
                      customClass="!p-0 !flex-shrink-0 border-none"
                      type={"secondary"}
                      icon={
                        <EditIcon className="text-df-icon-color cursor-pointer" />
                      }
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 shrink-0">
                    <AvatarImage src={testimonial?.avatar?.url || testimonial?.avatar} alt={testimonial?.name} />
                    <AvatarFallback
                      style={{
                        backgroundColor: "#FF9966",
                        color: "#FFFFFF",
                        fontWeight: 500,
                      }}
                    >
                      {testimonial?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    {testimonial.linkedinLink && testimonial.linkedinLink?.trim() !== "" ? (
                      <a
                        href={testimonial.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <MemoLinkedin className="text-df-icon-color w-4 h-4 cursor-pointer" />
                        <span className="font-semibold text-base cursor-pointer">
                          {testimonial?.name}
                        </span>
                      </a>
                    ) : (
                      <h3 className="font-semibold text-base mb-0">
                        {testimonial?.name}
                      </h3>
                    )}
                    <p className="text-sm text-df-description-color">
                      {testimonial?.role ? `${testimonial.role}, ` : ""}
                      {testimonial?.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {!isMobile && reviews?.length > 4 && (
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button variant="outline" onClick={() => setShowMore(!showMore)}>
            {showMore ? "Show Less" : "View More"}
          </Button>
        </motion.div>
      )}

      {edit && (
        <div className="flex items-center gap-2 mt-6">
          <AddItem
            className="bg-df-section-card-bg-color shadow-df-section-card-shadow flex-1"
            title="Add your testimonial"
            onClick={() => openSidebar(sidebars.review)}
            iconLeft={
              reviews?.length > 0 ? (
                <Button2
                  type="secondary"
                  icon={
                    <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                  }
                  onClick={() => openSidebar(sidebars.review)}
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
                  onClick={() => openSidebar(sidebars.review)}
                  size="small"
                />
              ) : (
                false
              )
            }
            theme={theme}
          />
          {reviews?.length > 1 && (
            <ButtonNew
              variant="secondary"
              size="icon"
              onClick={() => {
                setShowSortModal(true);
              }}
              className="rounded-full h-14 w-14"
            >
              <SortIcon className="w-4 h-4 text-df-icon-color cursor-pointer" />
            </ButtonNew>
          )}
        </div>
      )}

      {/* Sort Modal */}
      <SortableModal
        show={showSortModal}
        onClose={() => setShowSortModal(false)}
        items={userDetails?.reviews?.map((review) => review._id) || []}
        onSortEnd={handleSortEnd}
        sensors={sortSensors}
        useButton2={true}
      >
        {userDetails?.reviews?.map((review) => (
          <SortableTestimonialItem
            key={review._id}
            review={review}
            edit={edit}
          />
        ))}
      </SortableModal>
    </section>
  );
};

const SortableTestimonialItem = ({ review, edit }) => {
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
