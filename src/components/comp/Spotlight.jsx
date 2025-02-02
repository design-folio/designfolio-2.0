import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export const Spotlight = ({ userDetails }) => {
  const { experiences } = userDetails || {};

  const [expandedCards, setExpandedCards] = useState([]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const expandContent = {
    hidden: { height: 0, opacity: 0 },
    show: {
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
          delay: 0.1,
        },
      },
    },
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const toggleExpand = (index) => {
    setExpandedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold mb-8">Work Experience</h2>
      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        className="space-y-6"
      >
        {experiences.map((experience, index) => (
          <motion.div
            key={index}
            variants={item}
            className="group bg-card p-6 rounded-lg hover:bg-card/80 transition-colors relative overflow-hidden shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full" />
            </div>
            <div className="relative z-10">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{experience.role}</h3>
                  <span className="text-sm text-foreground/60">
                    {`${experience?.startMonth} ${experience?.startYear} - ${
                      experience?.currentlyWorking
                        ? "Present"
                        : `${experience?.endMonth} ${experience?.endYear}`
                    }  `}
                  </span>
                </div>
                <div className="text-base text-foreground/80">
                  {experience.company}
                </div>
                <p className="text-sm text-foreground/60 mt-2">
                  {experience?.description?.split("\n").map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
                  {/* {!expandedCards.includes(index) && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="ml-1 text-foreground hover:text-foreground/80 inline-flex items-center gap-1"
                    >
                      View More
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  )} */}
                </p>

                <motion.div
                  variants={expandContent}
                  initial="hidden"
                  animate={expandedCards.includes(index) ? "show" : "hidden"}
                  className="overflow-hidden"
                >
                  <div className="mt-4 text-sm text-foreground/60 whitespace-pre-line">
                    {experience.expandedContent}
                    {expandedCards.includes(index) && (
                      <button
                        onClick={() => toggleExpand(index)}
                        className="ml-1  mt-2 text-foreground hover:text-foreground/80 inline-flex items-center gap-1"
                      >
                        Show Less
                        <ChevronUp className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
