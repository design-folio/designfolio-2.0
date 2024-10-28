import React, { useState } from "react";
import { motion } from "framer-motion";
import customTwMerge from "@/lib/customTailwindMerge";
import Button from "./button";
import ViewArrowIcon from "../../public/assets/svgs/viewArrow.svg";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";
import DragIcon from "../../public/assets/svgs/drag.svg";
import Text from "./text";
import { SortableHandle } from "react-sortable-hoc";
const imageVariants = {
  hover: {
    scale: 1.13, // Target scale when hovered
    transition: {
      duration: 0.35, // Smooth and quick transition
      // ease: "easeInOut", // Smoothly accelerates and decelerates
    },
  },
  initial: {
    scale: 1, // Initial scale
    transition: {
      duration: 0.35, // Match the duration of the hover state for consistency
      // ease: "easeInOut", // Use the same easing to ensure a smooth transition back
    },
  },
};

export default function ProjectCard({
  className,
  project,
  onDeleteProject,
  edit = false,
  handleRouter,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  return (
    <div
      className={customTwMerge(
        `bg-project-card-bg-color border border-project-card-border-color rounded-2xl min-h-[360px] h-full cursor-pointer`,
        className
      )}
      onClick={() => handleRouter(project._id)}
    >
      <div className="h-full flex flex-col">
        <div className="h-[253.072px] relative  overflow-hidden rounded-t-[15px]">
          <motion.img
            src={project?.thumbnail?.url}
            alt="project image"
            className={`w-full h-full object-cover transition-opacity duration-100 ${
              imageLoaded ? "opacity-100" : "opacity-100"
            }`}
            initial="initial"
            whileHover="hover"
            variants={imageVariants}
            loading="lazy"
            fetchPriority="high"
            decoding="async"
            // onLoad={() => setImageLoaded(true)}
          />
          {/* {!imageLoaded && (
            <div className="w-full h-full bg-df-placeholder-color absolute top-0 right-0" />
          )} */}
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <Text
              size="p-small"
              className="text-project-card-heading-color font-semibold line-clamp-2"
            >
              {project?.title}
            </Text>
          </div>
          <div className="flex justify-between gap-3  items-center mt-4">
            {edit ? (
              <Button
                text={"Edit project"}
                customClass="w-full"
                type="secondary"
              />
            ) : (
              <motion.div
                className="flex gap-1 flex-1 w-fit"
                onHoverStart={() => setIsHovered(true)} // Set hover state to true when hovered
                onHoverEnd={() => setIsHovered(false)}
              >
                <Text
                  size="p-xsmall"
                  className="text-project-card-description-color"
                >
                  View project
                </Text>
                <motion.div
                  animate={{ x: isHovered ? 5 : 0, y: isHovered ? -5 : 0 }} // Use isHovered to control animation
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ViewArrowIcon className="text-project-card-description-color" />
                </motion.div>
              </motion.div>
            )}
            {edit && (
              <div className="flex gap-4">
                <Button
                  type="delete"
                  icon={
                    <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6" />
                  }
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the event from bubbling up
                    onDeleteProject(project);
                  }}
                />
                <DragHandle />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const DragHandle = SortableHandle(() => (
  <div
    onClick={(e) => e.stopPropagation()}
    className="!px-[24.5px] !cursor-grab py-[19px] transition-shadow duration-500 ease-out bg-project-card-reorder-btn-bg-color border-project-card-reorder-btn-bg-color hover:border-primary-btn-bg-hover-color hover:bg-primary-btn-bg-hover-color rounded-2xl"
  >
    <DragIcon className="text-project-card-reorder-btn-icon-color" />
  </div>
));
