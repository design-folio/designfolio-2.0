import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, EditIcon } from "lucide-react";
import { useState, useRef } from "react";
import PlusIcon from "../../../../public/assets/svgs/plus.svg";
import SortIcon from "../../../../public/assets/svgs/sort.svg";
import AddItem from "@/components/addItem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { useTheme } from "next-themes";
import Button2 from "@/components/button";
import MemoLinkedin from "@/components/icons/Linkedin";
import MemoTestimonial from "@/components/icons/Testimonial";
import ClampableTiptapContent from "@/components/ClampableTiptapContent";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { _updateUser } from "@/network/post-request";
import SortableModal from "@/components/SortableModal";
import ReviewCard from "@/components/reviewCard";
import DragHandle from "@/components/DragHandle";
import { Button as ButtonNew } from "@/components/ui/buttonNew";

export const SpotlightTestimonialsSection = ({ userDetails, edit, headerActions }) => {
  const { reviews } = userDetails || {};
  const [showMore, setShowMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState([]);
  const [showSortModal, setShowSortModal] = useState(false);
  const isMobile = useIsMobile();
  const visibleTestimonials = showMore ? reviews : reviews?.slice(0, 4);
  const theme = useTheme();
  const { openSidebar, openNewReview, setSelectedReview, setUserDetails, updateCache } =
    useGlobalContext();

  const sortSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSortEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = userDetails.reviews.findIndex((review) => review._id === active.id);
    const newIndex = userDetails.reviews.findIndex((review) => review._id === over.id);

    const sortedReviews = arrayMove(userDetails.reviews, oldIndex, newIndex);

    setUserDetails((prev) => ({ ...prev, reviews: sortedReviews }));
    _updateUser({ reviews: sortedReviews }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 >= visibleTestimonials.length ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? visibleTestimonials.length - 1 : prev - 1));
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
      <div className="mb-12 flex items-center justify-between gap-4">
        <h2 className="flex-1 text-3xl font-bold">What People Say</h2>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </div>

      <div
        className={`relative ${
          isMobile ? "px-4" : "mx-auto grid max-w-[848px] grid-cols-2 gap-6 px-4"
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
                    className="bg-review-card-bg-color border-border/30 hover-elevate shadow-df-card-soft-shadow flex flex-col rounded-2xl border p-6 transition-all"
                  >
                    <div className="mb-6 flex flex-1 items-start gap-2">
                      <div className="flex-1">
                        <ClampableTiptapContent
                          content={visibleTestimonials[currentIndex]?.description || ""}
                          mode="review"
                          enableBulletList={false}
                          maxLines={3}
                          itemId={visibleTestimonials[currentIndex]?._id}
                          expandedIds={expandedCards}
                          onToggleExpand={toggleExpand}
                          buttonClassName="mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage
                          src={
                            visibleTestimonials[currentIndex]?.avatar?.url ||
                            visibleTestimonials[currentIndex]?.avatar
                          }
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
                            className="flex cursor-pointer items-center gap-1 text-blue-500 transition-colors hover:text-blue-600"
                          >
                            <MemoLinkedin className="text-df-icon-color h-4 w-4 cursor-pointer" />
                            <span className="cursor-pointer text-base font-semibold">
                              {visibleTestimonials[currentIndex]?.name}
                            </span>
                          </a>
                        ) : (
                          <h3 className="mb-0 text-base font-semibold">
                            {visibleTestimonials[currentIndex]?.name}
                          </h3>
                        )}
                        <p className="text-df-description-color text-sm">
                          {visibleTestimonials[currentIndex]?.role
                            ? `${visibleTestimonials[currentIndex]?.role}, `
                            : ""}
                          {visibleTestimonials[currentIndex]?.company}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-6 flex justify-center gap-4">
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
                className="bg-review-card-bg-color border-border/30 hover-elevate shadow-df-card-soft-shadow flex flex-col rounded-2xl border p-6 transition-all"
              >
                <div className="mb-6 flex flex-1 items-start gap-2">
                  <div className="flex-1">
                    <ClampableTiptapContent
                      content={testimonial.description || ""}
                      mode="review"
                      enableBulletList={false}
                      maxLines={3}
                      itemId={testimonial._id}
                      expandedIds={expandedCards}
                      onToggleExpand={toggleExpand}
                      buttonClassName="mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
                    />
                  </div>
                  {edit && (
                    <Button2
                      onClick={() => handleClick(testimonial)}
                      customClass="!p-0 !shrink-0 border-none"
                      type={"secondary"}
                      icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage
                      src={testimonial?.avatar?.url || testimonial?.avatar}
                      alt={testimonial?.name}
                    />
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
                        className="flex cursor-pointer items-center gap-1 text-blue-500 transition-colors hover:text-blue-600"
                      >
                        <MemoLinkedin className="text-df-icon-color h-4 w-4 cursor-pointer" />
                        <span className="cursor-pointer text-base font-semibold">
                          {testimonial?.name}
                        </span>
                      </a>
                    ) : (
                      <h3 className="mb-0 text-base font-semibold">{testimonial?.name}</h3>
                    )}
                    <p className="text-df-description-color text-sm">
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
          className="mt-8 text-center"
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
        <div className="mt-6 flex items-center gap-2">
          <AddItem
            className="bg-card shadow-df-section-card-shadow flex-1"
            title="Add your testimonial"
            onClick={() => openNewReview()}
            iconLeft={
              reviews?.length > 0 ? (
                <Button2
                  type="secondary"
                  icon={
                    <PlusIcon className="text-secondary-btn-text-color h-[12px] w-[12px] cursor-pointer" />
                  }
                  onClick={() => openNewReview()}
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
                    <PlusIcon className="text-secondary-btn-text-color h-[12px] w-[12px] cursor-pointer" />
                  }
                  onClick={() => openNewReview()}
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
              className="h-14 w-14 rounded-full"
            >
              <SortIcon className="text-df-icon-color h-4 w-4 cursor-pointer" />
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
          <SortableTestimonialItem key={review._id} review={review} edit={edit} />
        ))}
      </SortableModal>
    </section>
  );
};

const SortableTestimonialItem = ({ review, edit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: review._id,
  });

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
      className={`flex items-center justify-between gap-4 ${isDragging ? "relative" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <ReviewCard review={review} sorting={true} edit={edit} />
      </div>
      <div className="shrink-0">
        <DragHandle listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
};
