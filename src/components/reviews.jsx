import { Button } from "@/components/ui/buttonNew";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { motion } from "motion/react";
import { Plus, PlusIcon, Pencil } from "lucide-react";
import { FaLinkedin as Linkedin } from "react-icons/fa6";
import { useTheme } from "next-themes";
import { useState } from "react";
import SortIcon from "../../public/assets/svgs/sort.svg";
import AddItem from "./addItem";
import Button2 from "./button";
import MemoTestimonial from "./icons/Testimonial";
import Section from "./section";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClampableTiptapContent from "./ClampableTiptapContent";
import MemoQuoteIcon from "./icons/QuoteIcon";

export default function Reviews({ edit = false, openModal, userDetails }) {
  const { setSelectedReview } = useGlobalContext();
  const reviews = userDetails?.reviews || [];
  const hasMultipleReviews = reviews.length >= 2;
  const theme = useTheme();
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);

  const buttonStyles =
    "static h-10 w-10 rounded-full border border-border/20 bg-df-section-card-bg-color text-df-icon-color shadow-sm hover:bg-df-section-card-bg-color/80 active:scale-[0.98] transition-all translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed";

  const toggleExpandReview = (id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
        sectionId="reviews"
        actions={
          edit && reviews.length > 0 ? (
            <div className="flex items-center gap-2">
              {reviews.length > 1 && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => openModal(sidebars.sortReviews)}
                        className="h-11 w-11 rounded-full"
                        aria-label="Reorder Testimonials"
                      >
                        <SortIcon className="text-df-icon-color h-4 w-4 cursor-pointer" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={8}
                      className="bg-tooltip-bg-color text-tooltip-text-color rounded-xl border-0 px-4 py-2 shadow-xl"
                    >
                      <span className="text-sm font-medium">Reorder Testimonials</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                variant="secondary"
                size="icon"
                onClick={() => openModal(sidebars.review)}
                className="h-11 w-11 rounded-full"
                data-testid="button-add-testimonial"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          ) : null
        }
        wallpaper={userDetails?.wallpaper}
      >
        {reviews.length > 0 ? (
          <div className="relative -mx-6 mt-6 overflow-visible px-6 lg:-mx-10 lg:px-10">
            <Carousel
              opts={{
                align: hasMultipleReviews ? "start" : "center",
                loop: hasMultipleReviews,
              }}
              className="w-full overflow-visible"
            >
              <div className="overflow-visible">
                <CarouselContent className={hasMultipleReviews ? "-ml-6" : "ml-0 justify-center"}>
                  {(hasMultipleReviews ? [...reviews, ...reviews, ...reviews] : reviews).map(
                    (review, idx) => (
                      <CarouselItem
                        key={`${review._id}-${idx}`}
                        className={
                          hasMultipleReviews
                            ? "overflow-visible py-4 pl-6 md:basis-1/2"
                            : "mx-auto max-w-2xl overflow-visible py-4 pl-0 md:basis-full"
                        }
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="group bg-review-card-bg-color hover-elevate border-border/50 shadow-df-card-soft-shadow relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-300"
                        >
                          <div className="mt-2 mb-4 flex items-center justify-between">
                            <MemoQuoteIcon className="text-df-icon-color opacity-20" />

                            {edit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => {
                                  setSelectedReview(review);
                                  openModal(sidebars.review);
                                }}
                              >
                                <Pencil className="text-df-icon-color h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="mb-8 flex-1">
                            <ClampableTiptapContent
                              content={review?.description || ""}
                              mode="review"
                              enableBulletList={false}
                              maxLines={3}
                              itemId={review?._id ?? `${idx}`}
                              expandedIds={expandedReviewIds}
                              onToggleExpand={toggleExpandReview}
                            />
                          </div>

                          <div className="mt-auto flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 shrink-0 rounded-xl">
                                <AvatarImage
                                  src={review?.avatar?.url || review?.avatar}
                                  alt={review?.name}
                                />
                                <AvatarFallback
                                  className="rounded-none"
                                  style={{ backgroundColor: "#FF9966", color: "#FFFFFF" }}
                                >
                                  {review?.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <h3 className="text-df-heading-color mb-0.5 text-sm font-semibold">
                                  {review?.name}
                                </h3>
                                <p className="text-df-description-color text-xs">
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
                                className="text-foreground-landing/20 -mr-2 p-2 transition-colors hover:text-[#0077B5]"
                              >
                                <Linkedin className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      </CarouselItem>
                    )
                  )}
                </CarouselContent>
              </div>
              {hasMultipleReviews && (
                <div className="mt-4 flex justify-center gap-2">
                  <CarouselPrevious className={buttonStyles} />
                  <CarouselNext className={buttonStyles} />
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
                        <PlusIcon className="text-secondary-btn-text-color h-[12px] w-[12px] cursor-pointer" />
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
                        <PlusIcon className="text-secondary-btn-text-color h-[12px] w-[12px] cursor-pointer" />
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
    </motion.div>
  );
}
