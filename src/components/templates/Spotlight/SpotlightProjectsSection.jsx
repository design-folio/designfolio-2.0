import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { useCursorTooltip } from "@/context/cursorTooltipContext";
import { useRouter } from "next/router";
import Button from "@/components/button";
import DeleteIcon from "../../../../public/assets/svgs/deleteIcon.svg";
import AddCard from "@/components/AddCard";
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
import ProjectLock from "@/components/projectLock";
import MemoCasestudy from "@/components/icons/Casestudy";
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
      {sortedProjects.length > 0 && (
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
      {edit &&
        (userDetails?.pro || (userDetails?.projects || []).filter((p) => !p.hidden).length < 2 ? (
          <AddCard
            title={`${
              visibleProjects.length === 0 ? "Upload your first case study" : "Add case study"
            }`}
            subTitle="Show off your best work."
            first={sortedProjects.length !== 0}
            buttonTitle="Add case study"
            secondaryButtonTitle="Write using AI"
            onClick={() => openSidebar(sidebars.project)}
            icon={<MemoCasestudy className="size-[72px] cursor-pointer" />}
            openModal={openModal}
            className={`bg-secondary mt-6 flex items-center justify-center ${
              visibleProjects.length !== 0 &&
              "shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)] hover:shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]"
            }`}
          />
        ) : (
          <div className="mt-6">
            <ProjectLock />
          </div>
        ))}
    </section>
  );
};

export default SpotlightProjectsSection;
