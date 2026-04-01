import { Button } from "@/components/ui/buttonNew";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { motion } from "framer-motion";
import { Plus, PlusIcon, Pencil, Linkedin } from "lucide-react";
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
  CarouselNext
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
                        className="rounded-full h-11 w-11"
                        aria-label="Reorder Testimonials"
                      >
                        <SortIcon className="w-4 h-4 text-df-icon-color cursor-pointer" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8} className="bg-tooltip-bg-color text-tooltip-text-color border-0 px-4 py-2 rounded-xl shadow-xl">
                      <span className="text-sm font-medium">Reorder Testimonials</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
          <div className="mt-6 -mx-6 lg:-mx-10 px-6 lg:px-10 overflow-visible relative">
            <Carousel
              opts={{
                align: hasMultipleReviews ? "start" : "center",
                loop: hasMultipleReviews,
              }}
              className="w-full overflow-visible"
            >
              <div className="overflow-visible">
                <CarouselContent className={hasMultipleReviews ? "-ml-6" : "justify-center ml-0"}>
                  {(hasMultipleReviews ? [...reviews, ...reviews, ...reviews] : reviews).map((review, idx) => (
                    <CarouselItem
                      key={`${review._id}-${idx}`}
                      className={
                        hasMultipleReviews
                          ? "pl-6 md:basis-1/2 overflow-visible py-4"
                          : "pl-0 md:basis-full overflow-visible py-4 max-w-2xl mx-auto"
                      }
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="group rounded-2xl p-6 flex flex-col relative transition-all duration-300 h-full bg-review-card-bg-color hover-elevate border border-border/50 shadow-df-card-soft-shadow"
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
              {hasMultipleReviews && (
                <div className="flex justify-center gap-2 mt-4">
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
        )
        }
      </Section >
    </motion.div >
  );
}
