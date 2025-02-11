import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, EditIcon } from "lucide-react";
import AddItem from "../addItem";
import Button from "../button";
import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";
import PlusIcon from "../../../public/assets/svgs/plus.svg";
import BagIcon from "../../../public/assets/svgs/bag.svg";
import { useTheme } from "next-themes";

export const Spotlight = ({ userDetails, edit }) => {
  const { experiences } = userDetails || {};
  const { openModal, setSelectedWork } = useGlobalContext();
  const { theme } = useTheme();
  const [expandedCards, setExpandedCards] = useState([]);
  const handleClick = (work) => {
    setSelectedWork(work);
    openModal(modals.work);
  };

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
    <section className="py-12">
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
                <div className="flex flex-col lg:flex-row gap-2 justify-between items-start">
                  <h3 className="font-semibold text-lg">{experience.role}</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {`${experience?.startMonth} ${experience?.startYear} - ${
                        experience?.currentlyWorking
                          ? "Present"
                          : `${experience?.endMonth} ${experience?.endYear}`
                      }  `}
                    </span>{" "}
                    {edit && (
                      <Button
                        onClick={() => handleClick(experience)}
                        customClass="!p-0 !flex-shrink-0 border-none"
                        type={"secondary"}
                        icon={
                          <EditIcon className="text-gray-600 dark:text-gray-400 cursor-pointer" />
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="text-base text-gray-600 dark:text-gray-400">
                  {experience.company}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {experience.description.slice(
                    0,
                    !expandedCards.includes(index)
                      ? 180
                      : experience.description?.length - 1
                  )}
                  {!expandedCards.includes(index) ? (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="ml-1 text-foreground hover:text-foreground/80 inline-flex items-center gap-1"
                    >
                      View More
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="ml-1 text-foreground hover:text-foreground/80 inline-flex items-center gap-1"
                    >
                      Show Less
                      <ChevronUp className="h-3 w-3" />
                    </button>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {edit && (
        <AddItem
          className="bg-df-section-card-bg-color shadow-df-section-card-shadow mt-4"
          title="Add your work experience"
          onClick={() => openModal(modals.work)}
          iconLeft={
            userDetails?.experiences?.length > 0 ? (
              <Button
                type="secondary"
                icon={
                  <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                }
                onClick={() => openModal(modals.work)}
                size="small"
              />
            ) : (
              <BagIcon />
            )
          }
          iconRight={
            userDetails?.experiences?.length == 0 ? (
              <Button
                type="secondary"
                icon={
                  <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                }
                onClick={() => openModal(modals.work)}
                size="small"
              />
            ) : (
              false
            )
          }
          theme={theme}
        />
      )}
    </section>
  );
};
