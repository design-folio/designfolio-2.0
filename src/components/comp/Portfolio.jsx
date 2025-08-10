import {
  Mail,
  ArrowRight,
  EditIcon,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Footer } from "@/components/comp/Footer";
import { useRouter } from "next/router";
import Button2 from "../button";
import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";
import DeleteIcon from "../../../public/assets/svgs/deleteIcon.svg";
import AddCard from "../AddCard";
import ProjectIcon from "../../../public/assets/svgs/projectIcon.svg";
import PlusIcon from "../../../public/assets/svgs/plus.svg";
import BagIcon from "../../../public/assets/svgs/bag.svg";
import AddItem from "../addItem";
import { useTheme } from "next-themes";
import Spotlight from "./Spotlight";
import DragIcon from "../../../public/assets/svgs/drag.svg";

// DND Kit Imports
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { Testimonials } from "./Testimonials";
import { _updateUser } from "@/network/post-request";
import ProjectLock from "../projectLock";

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
    const cardRef = useRef(null);
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: project._id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
      <div ref={setNodeRef} style={style}>
        <motion.div
          ref={cardRef}
          variants={item}
          onClick={() => handleNavigation(project?._id)}
          onMouseMove={handleMouseMove}
          className="group bg-card border border-card-border rounded-lg overflow-hidden hover:bg-card/80 transition-colors relative !cursor-pointer"
        >
          <div className="flex flex-col md:flex-row !cursor-pointer">
            <img
              src={project?.thumbnail?.url}
              alt={project.title}
              className="object-cover group-hover:scale-105 transition-transform duration-300 w-full lg:w-[320px] h-[261px] shrink-0 overflow-hidden !cursor-pointer"
            />
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
                <div className="flex justify-between gap-3 items-center mt-4 cursor-pointer">
                  <Button2
                    text={"Edit project"}
                    customClass="w-full"
                    type="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation(project?._id);
                    }}
                  />
                  <div className="flex gap-4">
                    <Button2
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
                  {/* Drag handle: attach drag listeners only here */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    {...listeners}
                    style={{ touchAction: "none" }}
                    className="!px-[24.5px] !cursor-grab py-[19px] transition-shadow duration-500 ease-out bg-project-card-reorder-btn-bg-color border-project-card-reorder-btn-bg-color hover:border-project-card-reorder-btn-bg-hover-color hover:bg-project-card-reorder-btn-bg-hover-color rounded-2xl"
                  >
                    <DragIcon className="text-project-card-reorder-btn-icon-color !cursor-grab" />
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

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-secondary-border py-6 bg-background transition-colors duration-300">
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
                src={avatar?.url || "/assets/svgs/avatar.svg"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
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

      <div className="container max-w-3xl mx-auto px-4 relative">
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
            <div className="w-full overflow-hidden relative py-4 before:absolute before:left-0 before:top-0 before:z-10 before:w-20 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:w-20 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent">
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
                  <span
                    key={index}
                    className="bg-card px-4 py-2 rounded-full text-sm"
                  >
                    {skill?.label}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Experience Section */}
        {(experiences.length > 0 || edit) && (
          <Spotlight userDetails={userDetails} edit={edit} />
        )}

        {/* Projects Section with Vertical Drag Handle Sorting */}
        {(projects.length > 0 || edit) && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={sortedProjects.map((project) => project._id)}
            >
              <motion.section
                variants={container}
                initial="hidden"
                animate="show"
                className="py-12 border-b border-secondary-border"
              >
                <h3 className="text-3xl font-bold mb-12">Featured Projects</h3>
                <div className="flex flex-col gap-6">
                  {sortedProjects.map((project, index) => (
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
                        title={`${
                          userDetails?.projects?.length === 0
                            ? "Upload your first case study"
                            : "Add case study"
                        }`}
                        subTitle="Show off your best work."
                        first
                        buttonTitle="Add case study"
                        secondaryButtonTitle="Write using AI"
                        onClick={() => openModal(modals.project)}
                        icon={<ProjectIcon className="cursor-pointer" />}
                        openModal={openModal}
                        className={`flex items-center justify-center min-h-[269px] rounded-lg ${
                          userDetails?.projects?.length !== 0 &&
                          "bg-df-section-card-bg-color shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)] hover:shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]"
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

        {/* Reviews Section */}
        {(reviews?.length > 0 || edit) && (
          <Testimonials userDetails={userDetails} edit={edit} />
        )}
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
