import React, { useState } from "react";
import { motion } from "framer-motion";
import customTwMerge from "@/lib/customTailwindMerge";
import Button from "./button";
import ViewArrowIcon from "../../public/assets/svgs/viewArrow.svg";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";
import DragHandle from "./DragHandle";
import Text from "./text";
import Link from "next/link";
import { Button as ButtonNew } from "./ui/buttonNew";
import { Eye, EyeOff, Pencil } from "lucide-react";
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
  href,
  dragHandleListeners,
  dragHandleAttributes,
  isDragging = false,
  wasRecentlyMoved = false,
  onToggleVisibility,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleLinkClick = (e) => {
    // Always prevent Link navigation when dragging, recently moved, or clicking drag handle
    const isDragHandle = !!e.target.closest('[data-drag-handle]');
    const isButton = e.target.closest('button');

    if (isDragging || wasRecentlyMoved || isDragHandle) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // If it's a button click, prevent Link navigation but let button handle it
    if (isButton) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Use a wrapper div to intercept all pointer events when needed
  const shouldBlockNavigation = isDragging || wasRecentlyMoved;

  const cardContent = (
    <div className={customTwMerge(
      `bg-project-card-bg-color border border-project-card-border-color rounded-2xl min-h-[360px] h-full cursor-pointer`,
      className
    )}>
      <div className="h-full flex flex-col">
        <div className="h-[253.072px] relative  overflow-hidden rounded-t-[15px]">
          <motion.img
            src={project?.thumbnail?.url}
            alt="project image"
            className={`w-full h-full object-cover transition-opacity duration-100 cursor-pointer ${imageLoaded ? "opacity-100" : "opacity-100"
              }`}
            initial="initial"
            whileHover="hover"
            variants={imageVariants}
            loading="lazy"
            fetchpriority="high"
            decoding="async"
          />
          {project?.hidden && (
            <div className="absolute top-3 right-3 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
              <EyeOff className="w-3 h-3" />
              Hidden from live site
            </div>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between cursor-pointer">
          <div>
            <p
              className="text-project-card-heading-color font-semibold line-clamp-2 cursor-pointer text-lg"
            >
              {project?.title}
            </p>
            <Text
              size="p-xxsmall"
              className="text-project-card-heading-color font-normal line-clamp-3 leading-relaxed cursor-pointer"
            >
              {project?.description}
            </Text>
          </div>
          <div className="mt-4 flex">
            {edit ? (
              <DragHandle
                isButton
                listeners={dragHandleListeners}
                attributes={dragHandleAttributes}
              />
            ) : (
              <motion.div
                className="flex gap-1 flex-1 w-fit"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <Text
                  size="p-xsmall"
                  className="text-project-card-description-color"
                >
                  View project
                </Text>
                <motion.div
                  animate={{ x: isHovered ? 2 : 0, y: isHovered ? -2 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ViewArrowIcon className="text-project-card-description-color cursor-pointer" />
                </motion.div>
              </motion.div>
            )}
            {edit && (
              <div className="flex gap-2 ml-auto">
                <Button
                  size="medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRouter(project?._id);
                  }}
                  icon={<Pencil className="w-4 h-4" />}
                  text={"Edit"}
                  type="secondary"
                />
                <Button
                  size="medium"
                  type="toggleVisibility"
                  isSelected={project?.hidden}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleVisibility?.(project?._id);
                  }}
                  icon={project?.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  text={project?.hidden ? "Hidden" : "Visible"}
                />
                <Button
                  size="medium"
                  type="delete"
                  icon={
                    <DeleteIcon className="stroke-delete-btn-icon-color h-6 w-6 cursor-pointer rounded-full" />
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteProject(project);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // When we need to block navigation, wrap in a div that intercepts clicks
  if (shouldBlockNavigation) {
    return (
      <div
        onClick={(e) => {
          // Allow buttons and drag handle to work
          const isButton = e.target.closest('button');
          const isDragHandle = !!e.target.closest('[data-drag-handle]');
          if (!isButton && !isDragHandle) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onMouseDown={(e) => {
          const isButton = e.target.closest('button');
          if (!isButton) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleLinkClick}
      onMouseDown={(e) => {
        if (isDragging || wasRecentlyMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {cardContent}
    </Link>
  );
}
