import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";

export const Testimonials = ({ userDetails }) => {
  const { reviews } = userDetails || {};
  const [showMore, setShowMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState([]);
  const isMobile = useIsMobile();
  const visibleTestimonials = showMore ? reviews : reviews?.slice(0, 4);

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

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-12 text-center">What People Say</h2>

      <div
        className={`relative ${
          isMobile ? "px-4" : "grid grid-cols-2 gap-6 max-w-4xl mx-auto px-4"
        }`}
      >
        {isMobile ? (
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
                className="bg-card border border-card-border p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <p className="dark:text-gray-400 text-gray-600">
                  {visibleTestimonials[currentIndex]?.description}
                  {/* {!expandedCards.includes(
                    visibleTestimonials[currentIndex].id
                  ) && (
                    <button
                      onClick={() =>
                        toggleExpand(visibleTestimonials[currentIndex].id)
                      }
                      className="ml-1 text-foreground/80 hover:text-foreground inline-flex items-center gap-1"
                    >
                      View More
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  )} */}
                </p>

                <AnimatePresence initial={false}>
                  {expandedCards.includes(
                    visibleTestimonials[currentIndex].id
                  ) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="dark:text-gray-400 text-gray-600 mt-4">
                        {visibleTestimonials[currentIndex].expandedContent}
                        <button
                          onClick={() =>
                            toggleExpand(visibleTestimonials[currentIndex].id)
                          }
                          className="ml-1 block mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1"
                        >
                          Show Less
                          <ChevronUp className="h-3 w-3" />
                        </button>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {visibleTestimonials[currentIndex].name}
                    </h4>
                    <p className="text-sm dark:text-gray-400 text-gray-600">
                      {visibleTestimonials[currentIndex].company}
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
        ) : (
          <AnimatePresence initial={false}>
            {visibleTestimonials?.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
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
                className="bg-card border border-card-border p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-300"
              >
                <p className="dark:text-gray-400 text-gray-600">
                  {testimonial.description}
                  {/* {!expandedCards.includes(testimonial.id) && (
                    <button
                      onClick={() => toggleExpand(testimonial.id)}
                      className="ml-1 text-foreground/80 hover:text-foreground inline-flex items-center gap-1"
                    >
                      View More
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  )} */}
                </p>

                <AnimatePresence initial={false}>
                  {expandedCards.includes(testimonial.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="dark:text-gray-400 text-gray-600 mt-4">
                        {testimonial.expandedContent}
                        <button
                          onClick={() => toggleExpand(testimonial.id)}
                          className="ml-1 block mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1"
                        >
                          Show Less
                          <ChevronUp className="h-3 w-3" />
                        </button>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm dark:text-gray-400 text-gray-600">
                      {testimonial.company}
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
    </section>
  );
};
