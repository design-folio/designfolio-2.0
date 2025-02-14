import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/router";
import Button from "../button";
import DeleteIcon from "../../../public/assets/svgs/deleteIcon.svg";
import ProjectIcon from "../../../public/assets/svgs/projectIcon.svg";
import { useGlobalContext } from "@/context/globalContext";
import { modals } from "@/lib/constant";
import AddCard from "../AddCard";

export const WorkShowcase = ({ userDetails, edit }) => {
  const { projects } = userDetails || {};
  const router = useRouter();
  const { openModal, setSelectedProject } = useGlobalContext();

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

  // Custom IntersectionObserver for Next.js Page Router
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(entry.isIntersecting);
        }
      }
      // { threshold: 0.5 }
    );

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

  // Image Component with Loading State
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

  // Project Card Component
  const ProjectCard = ({ project }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
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
      <motion.div
        variants={itemVariants}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onClick={() => handleNavigation(project?._id)}
        className="group rounded-3xl bg-card overflow-hidden relative shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)] cursor-pointer"
      >
        {/* Hover effect */}
        <div
          className="pointer-events-none cursor-pointer absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,.1), transparent 40%)`,
          }}
        />
        {/* Project Image */}
        <div className="aspect-[4/3] cursor-pointer overflow-hidden bg-secondary/50 relative">
          <ImageWithPreload src={project?.thumbnail?.url} alt={project.title} />
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
          <h3 className="text-2xl font-semibold leading-tight cursor-pointer line-clamp-2">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-gray-400 line-clamp-2 cursor-pointer mt-3">
              {project.description}
            </p>
          )}

          {edit && (
            <div className="flex justify-between gap-3  items-center mt-4 cursor-pointer">
              <Button
                text={"Edit project"}
                customClass="w-full"
                type="secondary"
              />
              <div className="flex gap-4">
                <Button
                  type="delete"
                  icon={
                    <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6 cursor-pointer" />
                  }
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the event from bubbling up
                    onDeleteProject(project);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <section className="pt-0 pb-16">
      <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className={`${
          userDetails?.projects?.length === 0
            ? "bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words"
            : "grid grid-cols-1 md:grid-cols-2 gap-6"
        } `}
      >
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
        {edit && (
          <AddCard
            title={`${
              userDetails?.projects?.length === 0
                ? "Upload your first case study"
                : "Add case study"
            }`}
            subTitle="Show off your best work."
            first={userDetails?.projects?.length !== 0}
            buttonTitle="Add case study"
            secondaryButtonTitle="Write using AI"
            onClick={() => openModal(modals.project)}
            icon={<ProjectIcon className="cursor-pointer" />}
            openModal={openModal}
            className={`flex items-center justify-center ${
              userDetails?.projects?.length !== 0 &&
              "bg-df-section-card-bg-color shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)] hover:shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]"
            }`}
          />
        )}
      </motion.div>
    </section>
  );
};

export default WorkShowcase;
