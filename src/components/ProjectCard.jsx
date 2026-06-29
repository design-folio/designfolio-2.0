import customTwMerge from "@/lib/customTailwindMerge";
import { motion } from "motion/react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";
import { useCursorTooltip } from "@/context/cursorTooltipContext";
import Button from "./button";
import DragHandle from "./DragHandle";
import Text from "./text";
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
  preview = false,
  embeddedPreview = false,
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
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const handleLinkClick = (e) => {
    setCursorPill(false);
    // Always prevent Link navigation when dragging, recently moved, or clicking drag handle
    const isDragHandle = !!e.target.closest("[data-drag-handle]");
    const isButton = e.target.closest("button");

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

  const handleCardMouseDown = () => {
    setCursorPill(false);
  };

  const shouldBlockNavigation = isDragging || wasRecentlyMoved;
  const shouldShowTooltip = isHovered && !isDragging && !isHoveringInteractive && !embeddedPreview;
  const { setCursorPill } = useCursorTooltip();

  useEffect(() => {
    setCursorPill(shouldShowTooltip, "View Case Study");
  }, [shouldShowTooltip, setCursorPill]);

  const cardContent = (
    <div
      className="group relative h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsHoveringInteractive(false);
      }}
      onMouseDown={handleCardMouseDown}
    >
      <motion.div
        className={customTwMerge(
          `bg-project-card-bg-color border-project-card-border-color relative flex h-full min-h-[360px] w-full flex-col overflow-hidden rounded-2xl border`,
          !edit && !embeddedPreview && (shouldShowTooltip ? "" : "cursor-pointer"),
          embeddedPreview && "cursor-default",
          className
        )}
        whileHover={
          !edit && !embeddedPreview && !isDragging && !isHoveringInteractive
            ? {
                scale: 1.02,
                rotateX: 2,
                rotateY: -2,
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              }
            : {}
        }
        initial={{ scale: 1, rotateX: 0, rotateY: 0 }}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        style={{
          opacity: isDragging ? 0.9 : 1,
        }}
      >
        <div className="flex h-full min-h-full flex-col">
          {preview && embeddedPreview ? (
            <div
              className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-t-[15px]"
              style={{
                background:
                  "linear-gradient(135deg, rgb(252, 249, 246) 0%, rgb(249, 245, 241) 50%, rgb(245, 241, 237) 100%)",
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.02] to-transparent" />
              <img
                src={project?.thumbnail?.url}
                alt={project?.title || "Project"}
                className="h-24 w-24 object-contain opacity-20 transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ) : preview ? (
            <div className="relative h-[253.072px] overflow-hidden rounded-t-[15px]">
              <motion.img
                src={project?.thumbnail?.url}
                alt="project image"
                className={`h-full w-full object-cover transition-opacity duration-100 ${shouldShowTooltip ? "" : "cursor-pointer"} ${
                  imageLoaded ? "opacity-100" : "opacity-100"
                }`}
                initial="initial"
                whileHover="hover"
                variants={imageVariants}
                loading="lazy"
                fetchpriority="high"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.02] to-transparent" />
            </div>
          ) : (
            <div className="relative h-[253.072px] overflow-hidden rounded-t-[15px]">
              <motion.img
                src={project?.thumbnail?.url}
                alt="project image"
                className={`h-full w-full object-cover transition-opacity duration-100 ${shouldShowTooltip ? "" : "cursor-pointer"} ${
                  imageLoaded ? "opacity-100" : "opacity-100"
                }`}
                initial="initial"
                whileHover="hover"
                variants={imageVariants}
                loading="lazy"
                fetchpriority="high"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.02] to-transparent" />
              {project?.hidden && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  <EyeOff className="h-3 w-3" />
                  Hidden from live site
                </div>
              )}
            </div>
          )}

          <div
            className={`flex flex-1 flex-col justify-between ${!edit && !embeddedPreview && (shouldShowTooltip ? "" : "cursor-pointer")}`}
          >
            <div className="p-6 pb-0">
              <p
                className={`project-info-card-heading-color line-clamp-2 font-semibold ${!edit && !embeddedPreview && !shouldShowTooltip ? "cursor-pointer" : ""} mb-2 text-lg`}
              >
                {project?.title}
              </p>
              <Text
                size="p-xxsmall"
                className={`text-df-description-color line-clamp-3 leading-relaxed font-normal ${!edit && !embeddedPreview && !shouldShowTooltip ? "cursor-pointer" : ""}`}
              >
                {project?.description}
              </Text>
            </div>
            <div
              className="flex items-center px-4 py-4"
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
                <>
                  {/* <motion.div
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
                </motion.div> */}
                </>
              )}
              {edit && (
                <div className="ml-auto flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRouter(project?._id);
                    }}
                    customClass="!py-2 text-sm max-h-[38px] "
                    icon={<Pencil className="h-4 w-4" />}
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
                    icon={
                      project?.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />
                    }
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
        className="h-full w-full"
        onClick={(e) => {
          setCursorPill(false);
          // Allow buttons and drag handle to work
          const isButton = e.target.closest("button");
          const isDragHandle = !!e.target.closest("[data-drag-handle]");
          if (!isButton && !isDragHandle) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onMouseDown={(e) => {
          setCursorPill(false);
          const isButton = e.target.closest("button");
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

  // Embedded preview (e.g. iframe in builder): no link, no hover, no tooltip
  if (embeddedPreview) {
    return <div className="block h-full w-full">{cardContent}</div>;
  }

  // Preview mode: use Link so the project card is clickable (e.g. portfolio-preview, Preview1)
  return (
    <Link
      href={href}
      className="block h-full w-full"
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
