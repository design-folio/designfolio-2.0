import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/router";
import Button from "../button";
import DeleteIcon from "../../../public/assets/svgs/deleteIcon.svg";
import ProjectIcon from "../../../public/assets/svgs/projectIcon.svg";
import AddCard from "../AddCard";
import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";
import DragIcon from "../../../public/assets/svgs/drag.svg";

// DND Kit Imports
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { _updateUser } from "@/network/post-request";
import ProjectLock from "../projectLock";

export const WorkShowcase = ({ userDetails, edit }) => {
  const { projects } = userDetails || {};
  const router = useRouter();
  const { openModal, setSelectedProject, setUserDetails } = useGlobalContext();

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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView) {
        setInView(true);
      }
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [inView]);

  const handleNavigation = (id) => {
    router.push(
      edit
        ? `/project/${id}/editor`
        : router.asPath.includes("/portfolio-preview")
          ? `/project/${id}/preview`
          : `/project/${id}`
    );
  };

  // Image component with loading state
  const ImageWithPreload = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
      <div className="relative w-full h-full">
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-secondary/50"
          />
        )}
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          src={src}
          alt={alt}
          className="w-full cursor-pointer h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="eager"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  };

  // Maintain local state for sorted projects
  const [sortedProjects, setSortedProjects] = useState(projects || []);

  // Update state when projects prop changes
  useEffect(() => {
    setSortedProjects(projects || []);
  }, [projects]);

  // Handle drag end event to reorder projects
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedProjects.findIndex(
      (project) => project._id === active.id
    );
    const newIndex = sortedProjects.findIndex(
      (project) => project._id === over.id
    );

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
    const containerRef = useRef(null);
    // Setup DND Kit sortable functionality.
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: project._id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
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

    return (
      // Outer container receives the node ref and style.
      <div
        ref={(node) => {
          setNodeRef(node);
          containerRef.current = node;
        }}
        style={style}
      >
        {/* Animated card content */}
        <motion.div
          onMouseMove={handleMouseMove}
          onClick={() => handleNavigation(project?._id)}
          variants={itemVariants}
          className="group rounded-3xl bg-card overflow-hidden relative shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)] cursor-pointer"
        >
          {/* Hover effect */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,.1), transparent 40%)`,
            }}
          />
          {/* Project Image */}
          <div className="aspect-[4/3] cursor-pointer overflow-hidden bg-secondary/50 relative">
            <ImageWithPreload
              src={project?.thumbnail?.url}
              alt={project.title}
            />
            {/* Project Link */}
            <a
              href={project.link}
              className="absolute top-6 right-6 size-14 rounded-full bg-tertiary flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-tertiary-hover"
            >
              <ArrowUpRight className="size-6 text-white" />
            </a>
          </div>
          {/* Project Info */}
          <div className="p-8 pb-10 cursor-pointer">
            <h3 className="text-2xl font-semibold leading-tight line-clamp-2">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-gray-400 line-clamp-2 mt-3">
                {project.description}
              </p>
            )}
            {edit && (
              <div className="flex justify-between gap-3 items-center mt-4">
                <Button
                  text={"Edit project"}
                  customClass="w-full"
                  type="secondary"
                />
                <div className="flex gap-4">
                  <Button
                    size="icon"
                    type="delete"
                    icon={
                      <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6 cursor-pointer" />
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project);
                    }}
                  />
                </div>
                {/* Drag handle container: attach drag listeners here */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  {...listeners}
                  // Disable default touch actions to enable dragging on mobile.
                  style={{ touchAction: "none" }}
                  className="!px-[24.5px] !cursor-grab py-[19px] transition-shadow duration-500 ease-out bg-project-card-reorder-btn-bg-color border-project-card-reorder-btn-bg-color hover:border-project-card-reorder-btn-bg-hover-color hover:bg-project-card-reorder-btn-bg-hover-color rounded-full"
                >
                  <DragIcon className="text-project-card-reorder-btn-icon-color !cursor-grab" />
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
      <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>
      {/* Wrap the grid with DND Kit's context */}
      {userDetails?.projects.length > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedProjects.map((project) => project._id)}>
            <motion.div
              ref={ref}
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className={`${sortedProjects.length === 0
                ? "bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words"
                : "grid grid-cols-1 md:grid-cols-2 gap-6"
                }`}
            >
              {sortedProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </motion.div>
          </SortableContext>
        </DndContext>
      )}
      {edit &&
        (userDetails?.pro || userDetails?.projects.length < 1 ? (
          <AddCard
            title={`${sortedProjects.length === 0
              ? "Upload your first case study"
              : "Add case study"
              }`}
            subTitle="Show off your best work."
            first={sortedProjects.length !== 0}
            buttonTitle="Add case study"
            secondaryButtonTitle="Write using AI"
            onClick={() => openModal(modals.project)}
            icon={<ProjectIcon className="cursor-pointer" />}
            openModal={openModal}
            className={`flex items-center justify-center mt-6 ${sortedProjects.length !== 0 &&
              "bg-df-section-card-bg-color shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)] hover:shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]"
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

export default WorkShowcase;
