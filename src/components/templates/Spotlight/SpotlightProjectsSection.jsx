import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Pencil, Sparkles } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { useCursorTooltip } from "@/context/cursorTooltipContext";
import { useRouter } from "next/router";
import Button from "@/components/button";
import DeleteIcon from "../../../../public/assets/svgs/deleteIcon.svg";
import { useGlobalContext } from "@/context/globalContext";
import { modals, sidebars } from "@/lib/constant";
import DragHandle from "@/components/DragHandle";
import { _updateUser, _updateProject } from "@/network/post-request";

// DND Kit Imports
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Text from "@/components/text";
import { cn } from "@/lib/utils";

export const SpotlightProjectsSection = ({ userDetails: userDetailsProp, edit, headerActions }) => {
  const router = useRouter();
  const {
    openModal,
    openSidebar,
    setSelectedProject,
    setUserDetails,
    setShowUpgradeModal,
    setUpgradeModalUnhideProject,
    userDetails: userDetailsFromContext,
  } = useGlobalContext();
  // Always prioritize context over prop to ensure we get the latest updates
  const userDetails = userDetailsFromContext ?? userDetailsProp;

  // Variants for animation
  const containerVariants = {
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

  const itemVariants = {
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

  // IntersectionObserver to trigger animation
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView) {
        setInView(true);
      }
    });
    if (node) {
      observer.observe(node);
    }
    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [inView]);

  const getProjectHref = (id) =>
    edit
      ? `/project/${id}/editor`
      : router.asPath.includes("/portfolio-preview")
        ? `/project/${id}/preview`
        : `/project/${id}`;

  const handleNavigation = (id) => {
    router.push(getProjectHref(id));
  };

  // Image component with loading state
  const ImageWithPreload = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
      <div className="relative h-full w-full">
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-secondary/50 absolute inset-0"
          />
        )}
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          src={src}
          alt={alt}
          className="h-full w-full cursor-pointer object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="eager"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  };

  // Maintain local state for sorted projects
  const [sortedProjects, setSortedProjects] = useState(() => userDetails?.projects || []);

  // Update state when userDetails changes
  useEffect(() => {
    const currentProjects = userDetails?.projects || [];
    queueMicrotask(() => setSortedProjects([...currentProjects]));
  }, [userDetails]);

  // Filter out hidden projects in preview mode (when edit is false)
  const visibleProjects = React.useMemo(() => {
    if (!edit && sortedProjects) {
      return sortedProjects.filter((project) => !project.hidden);
    }
    return sortedProjects;
  }, [sortedProjects, edit]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event to reorder projects
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedProjects.findIndex((project) => project._id === active.id);
    const newIndex = sortedProjects.findIndex((project) => project._id === over.id);

    // Update the sorted order
    const newSortedProjects = arrayMove(sortedProjects, oldIndex, newIndex);
    setSortedProjects(newSortedProjects);

    // Update global user details and make API call
    setUserDetails((prev) => ({ ...prev, projects: newSortedProjects }));
    _updateUser({ projects: newSortedProjects });
  };

  // Draggable Project Card Component
  const ProjectCard = ({ project }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
    const containerRef = useRef(null);
    const { setCursorPill } = useCursorTooltip();
    // Setup DND Kit sortable functionality.
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: project._id,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 9999 : 1,
    };

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const onDeleteProject = (project) => {
      openModal(modals.deleteProject);
      setSelectedProject(project);
    };

    const handleToggleVisibility = (projectId) => {
      const project = sortedProjects.find((p) => p._id === projectId);
      const visibleCount = (sortedProjects || []).filter((p) => !p.hidden).length;
      const isUnhiding = project?.hidden === true;

      if (!userDetails?.pro && isUnhiding && visibleCount >= 2) {
        setUpgradeModalUnhideProject({ projectId, title: project?.title || "Project" });
        setShowUpgradeModal(true);
        return;
      }

      const updatedProjects = sortedProjects.map((project) => {
        if (project._id === projectId) {
          const updatedProject = { ...project, hidden: !project.hidden };
          // Update individual project on server
          _updateProject(projectId, { hidden: updatedProject.hidden });
          return updatedProject;
        }
        return project;
      });

      // Update local state
      setSortedProjects(updatedProjects);
      setUserDetails((prev) => ({ ...prev, projects: updatedProjects }));
      // Also update the entire projects array to keep it in sync
      _updateUser({ projects: updatedProjects });
    };

    const shouldShowTooltip = isHovered && !isDragging && !isHoveringInteractive;
    useEffect(() => {
      setCursorPill(shouldShowTooltip, "View Case Study");
    }, [shouldShowTooltip, setCursorPill]);

    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          containerRef.current = node;
        }}
        style={style}
        className={`${isDragging ? "relative" : ""} h-full`}
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onClick={() => {
            setCursorPill(false);
            handleNavigation(project?._id);
          }}
          onMouseDown={() => setCursorPill(false)}
          onMouseEnter={() => {
            setIsHovered(true);
            router.prefetch(getProjectHref(project?._id));
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsHoveringInteractive(false);
          }}
          variants={itemVariants}
          className="group bg-card relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,.1), transparent 40%)`,
            }}
          />
          <div className="bg-secondary/50 relative aspect-[4/3] cursor-pointer overflow-hidden">
            <ImageWithPreload src={project?.thumbnail?.url} alt={project.title} />
            {project?.hidden && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                <EyeOff className="h-3 w-3" />
                Hidden from live site
              </div>
            )}
          </div>
          <div className="flex flex-1 cursor-pointer flex-col justify-between">
            <div className={cn("p-6", edit && "pb-0")}>
              <h3 className="project-info-card-heading-color line-clamp-2 text-lg font-semibold">
                {project.title}
              </h3>
              {project.description && (
                <Text
                  size="p-xxsmall"
                  className="text-df-description-color line-clamp-3 leading-relaxed font-normal"
                >
                  {project.description}
                </Text>
              )}
            </div>
            {edit && (
              <div
                className="flex items-center px-4 py-4"
                onMouseEnter={() => setIsHoveringInteractive(true)}
                onMouseLeave={() => setIsHoveringInteractive(false)}
              >
                <DragHandle
                  isButton
                  listeners={listeners}
                  attributes={attributes}
                  className={"max-h-[34px]"}
                />
                <div className="ml-auto flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigation(project?._id);
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
                      handleToggleVisibility(project?._id);
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
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <section className="pt-0 pb-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Projects</h2>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </div>

      {visibleProjects.length === 0 ? (
        edit && (
          <div className="bg-background flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 px-4 py-16 text-center dark:border-white/10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.03] dark:bg-white/[0.03]">
              <svg
                className="h-6 w-6 text-[#7A736C] dark:text-[#9E9893]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-[15px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              No projects yet
            </h3>
            <p className="mb-5 max-w-[250px] text-[13px] text-[#7A736C] dark:text-[#9E9893]">
              Add some projects to showcase your work and experience.
            </p>
            <div className="flex flex-col items-center gap-3">
              <UIButton
                onClick={() => openSidebar(sidebars.project)}
                className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                <Pencil className="h-3.5 w-3.5" />
                Add Project
              </UIButton>
              <UIButton
                variant="secondary"
                onClick={() => openModal(modals.aiProject)}
                className="h-9 rounded-full px-5 text-[13px] font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Write with AI
              </UIButton>
            </div>
          </div>
        )
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={visibleProjects.map((project) => project._id)}
            strategy={rectSortingStrategy}
          >
            <motion.div
              ref={ref}
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              {visibleProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </motion.div>
          </SortableContext>
        </DndContext>
      )}

      {edit && visibleProjects.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-black/15 bg-black/[0.015] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.015] dark:hover:bg-white/[0.03]">
            <UIButton
              onClick={() => openSidebar(sidebars.project)}
              className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              <Pencil className="h-3.5 w-3.5" />
              Add Project
            </UIButton>
            <UIButton
              variant="secondary"
              onClick={() => openModal(modals.aiProject)}
              className="h-9 rounded-full px-5 text-[13px] font-medium"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Write with AI
            </UIButton>
          </div>
        </div>
      )}
    </section>
  );
};

export default SpotlightProjectsSection;
