import {
  Mail,
  ArrowRight,
  EditIcon,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import { HoverTooltip } from "../HoverTooltip";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import { Footer } from "@/components/comp/Footer";
import { useRouter } from "next/router";
import Button2 from "../button";
import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";
import DeleteIcon from "../../../public/assets/svgs/deleteIcon.svg";
import AddCard from "../AddCard";
import { useTheme } from "next-themes";
import Spotlight from "./Spotlight";
import DragHandle from "../DragHandle";

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Testimonials } from "./Testimonials";
import { _updateUser, _updateProject } from "@/network/post-request";
import ProjectLock from "../projectLock";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { cn } from "@/lib/utils";
import MemoCasestudy from "../icons/Casestudy";
import Tools from "../tools";
import { ToolStack } from "./ToolStack";
// import { ToolStack } from "./ToolStack";

// Template-specific default section orders
const TEMPLATE_DEFAULTS = {
  3: ['works', 'projects', 'tools', 'reviews'],
};

const getDefaultSectionOrder = (template) => {
  return TEMPLATE_DEFAULTS[template] || TEMPLATE_DEFAULTS[3];
};

const Portfolio = ({ userDetails, edit }) => {
  const router = useRouter();
  const {
    avatar,
    firstName,
    lastName,
    email,
    introduction,
    bio,
    skills,
    experiences,
    tools,
    projects,
    reviews,
  } = userDetails || {};
  const { openModal, setSelectedWork, setSelectedProject, setUserDetails } =
    useGlobalContext();

  // Get section order from userDetails or use template default
  const _raw = userDetails?.sectionOrder;
  const _defaultOrder = getDefaultSectionOrder(3);
  const _filtered = _raw && Array.isArray(_raw) && _raw.length > 0 ? _raw.filter(section => _defaultOrder.includes(section)) : null;
  const sectionOrder = _raw && Array.isArray(_raw) && _raw.length > 0 && _filtered && _filtered.length > 0
    ? _filtered
    : _defaultOrder;
  const [expandedCards, setExpandedCards] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const theme = useTheme();

  // Motion variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const textReveal = {
    initial: { y: 100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
    },
  };

  // Duplicate skills for smooth infinite scroll
  const scrollSkills = [
    ...skills,
    ...skills,
    ...skills,
    ...skills,
    ...skills,
    ...skills,
  ];

  const handleNavigation = (id) => {
    router.push(
      edit
        ? `/project/${id}/editor`
        : router.asPath.includes("/portfolio-preview")
          ? `/project/${id}/preview`
          : `/project/${id}`
    );
  };

  const onDeleteProject = (project) => {
    openModal(modals.deleteProject);
    setSelectedProject(project);
  };

  const handleToggleVisibility = (projectId) => {
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

  const toggleExpand = (index) => {
    setExpandedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // ---------------------------
  // Projects Drag & Drop Setup
  // ---------------------------
  const [sortedProjects, setSortedProjects] = useState(projects || []);
  useEffect(() => {
    setSortedProjects(projects || []);
  }, [projects]);

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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedProjects.findIndex(
      (project) => project._id === active.id
    );
    const newIndex = sortedProjects.findIndex(
      (project) => project._id === over.id
    );
    const newSortedProjects = arrayMove(sortedProjects, oldIndex, newIndex);
    setSortedProjects(newSortedProjects);
    setUserDetails((prev) => ({ ...prev, projects: newSortedProjects }));
    _updateUser({ projects: newSortedProjects });
  };

  // Sortable Project Card Component – vertical drag handle only
  const SortableProjectCard = ({ project, index }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
    const cardRef = useRef(null);
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: project._id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 9999 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} className={isDragging ? 'relative' : ''}>
        <motion.div
          ref={cardRef}
          variants={item}
          onClick={() => handleNavigation(project?._id)}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsHoveringInteractive(false);
          }}
          className={cn(
            "group bg-card border border-card-border rounded-lg overflow-hidden hover:bg-card/80 transition-colors relative !cursor-pointer",
            isHovered && !isDragging && !isHoveringInteractive && "hide-cursor-children"
          )}
        >
          <HoverTooltip
            isHovered={isHovered}
            isDragging={isDragging}
            isHoveringInteractive={isHoveringInteractive}
            text="View Project"
          />
          <div className="flex flex-col md:flex-row !cursor-pointer">
            <div className="relative w-full lg:w-[320px] h-[261px] shrink-0 overflow-hidden">
              <img
                src={project?.thumbnail?.url}
                alt={project.title}
                className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full !cursor-pointer"
              />
              {project?.hidden && (
                <div className="absolute top-3 right-3 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 z-10">
                  <EyeOff className="w-3 h-3" />
                  Hidden from live site
                </div>
              )}
            </div>
            <div className="p-8 flex flex-col justify-between flex-grow !cursor-pointer">
              <div>
                <h4 className="text-2xl font-semibold mb-3 line-clamp-2 !cursor-pointer">
                  {project.title}
                </h4>
                <p className="dark:text-gray-400 text-gray-600 line-clamp-2 !cursor-pointer">
                  {project.description}
                </p>
              </div>
              {edit && (
                <div
                  className="mt-4 flex"
                  onMouseEnter={() => setIsHoveringInteractive(true)}
                  onMouseLeave={() => setIsHoveringInteractive(false)}
                >
                  <DragHandle
                    isButton
                    listeners={listeners}
                    attributes={attributes}
                  />
                  <div className="flex gap-2 ml-auto">
                    <Button2
                      size="medium"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigation(project?._id);
                      }}
                      icon={<Pencil className="w-4 h-4" />}
                      text={"Edit"}
                      type="secondary"
                    />
                    <Button2
                      size="medium"
                      type="toggleVisibility"
                      isSelected={project?.hidden}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleVisibility(project?._id);
                      }}
                      icon={project?.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      text={project?.hidden ? "Hidden" : "Visible"}
                    />
                    <Button2
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
                </div>
              )}
              {!edit && (
                <Button2
                  variant="outline"
                  size="sm"
                  className="self-start mt-6 group/btn relative overflow-hidden"
                  asChild
                >
                  <a href={project.link} className="relative z-10">
                    <span className="absolute inset-0 group-hover/btn:bg-white/10 transition-colors duration-300" />
                    View Project
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button2>
              )}
            </div>
          </div>
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,.1), transparent 40%)`,
            }}
          />
        </motion.div>
      </div>
    );
  };

  const wallpaperExists = userDetails?.wallpaper && userDetails?.wallpaper?.value != 0;
  return (
    <div className={cn("min-h-screen bg-background text-foreground transition-colors duration-300", wallpaperExists && "max-w-[890px] mx-auto rounded-2xl mb-8", !edit && wallpaperExists && "mt-8")}>
      {/* Header */}

      <header className={cn("border-b border-secondary-border py-6 bg-background transition-colors duration-300 rounded-t-2xl",)}>
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            className="flex items-center justify-between"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
          >
            <motion.div
              className="flex items-center gap-3"
              variants={{
                hidden: { opacity: 0, y: -50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 100, damping: 15 },
                },
              }}
            >
              <img
                src={getUserAvatarImage(userDetails)}
                alt="Profile"
                className={cn(
                  "w-10 h-10 rounded-xl object-cover",
                  !avatar ? "bg-[#FFB088]" : ""
                )}
              />
              <div>
                <h2 className="text-foreground font-medium">{`${firstName} ${lastName}`}</h2>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-3"
              variants={{
                hidden: { opacity: 0, y: -50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 100, damping: 15 },
                },
              }}
            >
              <a href={`mailto:${email}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Button>
              </a>
              {edit && (
                <Button2
                  onClick={() => openModal("onboarding")}
                  customClass="!p-[8px] rounded-[8px] !flex-shrink-0"
                  type={"secondary"}
                  icon={
                    <EditIcon
                      className="text-df-icon-color cursor-pointer"
                      size={20}
                    />
                  }
                />
              )}
            </motion.div>
          </motion.div>
        </div>
      </header>

      <div className="container max-w-3xl mx-auto px-4 relative rounded-b-2xl">
        <div className="absolute left-0 top-0 w-px h-full bg-secondary-border" />
        <div className="absolute right-0 top-0 w-px h-full bg-secondary-border" />

        {/* Hero Section with Text Reveal */}
        <section className="py-12 border-b border-secondary-border overflow-hidden">
          <motion.div
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.h1
              className="text-4xl font-bold mb-4"
              variants={textReveal}
            >
              {introduction}
            </motion.h1>
            <motion.p
              className="dark:text-gray-400 text-gray-600 mb-6"
              variants={textReveal}
            >
              {bio}
            </motion.p>
            {/* Skills Infinite Scroll */}
            <motion.div
              variants={textReveal}
              className="w-full overflow-hidden relative py-4 before:absolute before:left-0 before:top-0 before:z-10 before:w-20 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:w-20 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent"
            >
              <motion.div
                className="flex gap-4 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 20,
                    ease: "linear",
                  },
                }}
              >
                {scrollSkills.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.4,
                      delay: (index % skills.length) * 0.05,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="bg-card px-4 py-2 rounded-full text-sm"
                  >
                    {skill?.label}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Sections rendered in order based on sectionOrder */}
        {sectionOrder.map((sectionId) => {
          if (sectionId === 'works') {
            return (
              <div key="works" id="section-works">
                {(experiences.length > 0 || edit) && (
                  <Spotlight userDetails={userDetails} edit={edit} />
                )}
              </div>
            );
          }
          
          if (sectionId === 'projects') {
            return (
              <div key="projects" id="section-projects">
                {(projects.length > 0 || edit) && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={visibleProjects.map((project) => project._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <motion.section
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="py-12 border-b border-secondary-border"
                      >
                        <h3 className="text-3xl font-bold mb-12">Featured Projects</h3>
                        <div className="flex flex-col gap-6">
                          {visibleProjects.map((project, index) => (
                            <SortableProjectCard
                              key={project._id}
                              project={project}
                              index={index}
                              handleNavigation={handleNavigation}
                              onDeleteProject={onDeleteProject}
                              edit={edit}
                            />
                          ))}
                          {edit &&
                            (userDetails?.pro || userDetails?.projects.length < 2 ? (
                              <AddCard
                                title={`${userDetails?.projects?.length === 0
                                  ? "Upload your first case study"
                                  : "Add case study"
                                  }`}
                                subTitle="Show off your best work."
                                first
                                buttonTitle="Add case study"
                                secondaryButtonTitle="Write using AI"
                                onClick={() => openModal(modals.project)}
                                icon={
                                  <MemoCasestudy className="cursor-pointer size-[72px]" />
                                }
                                openModal={openModal}
                                className={`bg-df-section-card-bg-color flex items-center justify-center min-h-[269px] rounded-lg ${userDetails?.projects?.length !== 0 &&
                                  " shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)] hover:shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]"
                                  }`}
                              />
                            ) : (
                              <ProjectLock />
                            ))}
                        </div>
                      </motion.section>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            );
          }
          
          if (sectionId === 'tools') {
            return (
              <div key="tools" id="section-tools">
                <ToolStack
                  userDetails={userDetails}
                  edit={edit}
                  titleClasses="text-3xl"
                />
              </div>
            );
          }
          
          if (sectionId === 'reviews') {
            return (
              <div key="reviews" id="section-reviews">
                {(reviews?.length > 0 || edit) && (
                  <Testimonials userDetails={userDetails} edit={edit} />
                )}
              </div>
            );
          }
          
          return null;
        })}
        <Footer userDetails={userDetails} edit={edit} />
      </div>
    </div>
  );
};

export default Portfolio;

export const getServerSideProps = async (context) => {
  return {
    props: {
      hideHeader: true,
    },
  };
};
