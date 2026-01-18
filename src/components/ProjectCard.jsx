import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e) => {
    // Use viewport coordinates for fixed positioning
    setMousePos({
      x: e.clientX,
      y: e.clientY,
    });
  };

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

  // Determine if tooltip should be shown (and cursor should be hidden)
  const shouldShowTooltip = isHovered && !isDragging && !isHoveringInteractive;

  const cardContent = (
    <div
      className={customTwMerge(
        "group relative w-full h-full",
        shouldShowTooltip && "hide-cursor-children"
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsHoveringInteractive(false);
      }}
    >
      {mounted && createPortal(
        <AnimatePresence>
          {shouldShowTooltip && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed pointer-events-none z-[99999] flex items-center gap-2 bg-df-orange-color text-white px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
              style={{
                left: `${mousePos.x}px`,
                top: `${mousePos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Eye className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">View Case Study</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      <motion.div
        className={customTwMerge(
          `bg-project-card-bg-color border border-project-card-border-color rounded-2xl min-h-[360px] h-full w-full flex flex-col overflow-hidden relative`,
          shouldShowTooltip ? '' : 'cursor-pointer',
          className
        )}
        whileHover={!isDragging && !isHoveringInteractive ? {
          scale: 1.02,
          rotateX: 2,
          rotateY: -2,
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        } : {}}
        initial={{ scale: 1, rotateX: 0, rotateY: 0 }}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        style={{
          boxShadow: isDragging
            ? '0 0 0 1px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.15)'
            : '0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
          opacity: isDragging ? 0.9 : 1,
        }}
      >
        <div className="h-full flex flex-col min-h-full">
          <div className="h-[253.072px] relative  overflow-hidden rounded-t-[15px]">
            <motion.img
              src={project?.thumbnail?.url}
              alt="project image"
              className={`w-full h-full object-cover transition-opacity duration-100 ${shouldShowTooltip ? '' : 'cursor-pointer'} ${imageLoaded ? "opacity-100" : "opacity-100"
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

          <div className={`flex-1 flex flex-col justify-between ${shouldShowTooltip ? '' : 'cursor-pointer'}`}>
            <div className="p-6 pb-0">
              <p
                className={`project-info-card-heading-color font-semibold line-clamp-2 ${shouldShowTooltip ? '' : 'cursor-pointer'} text-lg mb-2`}
              >
                {project?.title}
              </p>
              <Text
                size="p-xxsmall"
                className={`text-df-description-color font-normal line-clamp-3 leading-relaxed ${shouldShowTooltip ? '' : 'cursor-pointer'}`}
              >
                {project?.description}
              </Text>
            </div>
            <div
              className="flex px-4 py-4 items-center"
              onMouseEnter={() => setIsHoveringInteractive(true)}
              onMouseLeave={() => setIsHoveringInteractive(false)}
            >
              {edit ? (
                <DragHandle
                  isButton
                  listeners={dragHandleListeners}
                  attributes={dragHandleAttributes}
                  className={"max-h-[34px]"}
                />
              ) : (
                <motion.div
                  className="flex gap-1 flex-1 w-fit"
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  <Text
                    size="p-xsmall"
                    className="text-df-description-color"
                  >
                    View project
                  </Text>
                  <motion.div
                    animate={{ x: isHovered ? 2 : 0, y: isHovered ? -2 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ViewArrowIcon className={`text-df-description-color ${shouldShowTooltip ? '' : 'cursor-pointer'}`} />
                  </motion.div>
                </motion.div>
              )}
              {edit && (
                <div className="flex gap-2 ml-auto">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRouter(project?._id);
                    }}
                    customClass="!py-2 text-sm max-h-[38px] "
                    icon={<Pencil className="w-4 h-4" />}
                    text={"Edit"}
                    type="secondary"
                  />
                  <Button
                    type="toggleVisibility"
                    customClass="!py-2 text-sm max-h-[38px]"
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
                    type="delete"
                    icon={
                      <DeleteIcon className="stroke-delete-btn-icon-color h-5 w-5 cursor-pointer" />
                    }
                    customClass="!p-2.5 max-h-10"
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
      </motion.div>
    </div>
  );

  // When we need to block navigation, wrap in a div that intercepts clicks
  if (shouldBlockNavigation) {
    return (
      <div
        className="w-full h-full"
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
      className="w-full h-full block"
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
